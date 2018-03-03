const r = require('rethinkdb');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jwt-simple');
const config = require('../config');
const { handleError } = require('../utils/errorHelpers');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

function genSalt() {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) reject(err);
      resolve(salt);
    });
  });
}

function genHash(salt, password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, salt, null, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
}

exports.signin = function signIn(req, res, next) {
  // User has already had their email and password auth'd
  // We just need to give them a token
  res.send({ token: tokenForUser(req.user) });
};

exports.signup = function signUp(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide and email and a password' });
  }

  // See if a user with a given email exists
  return r.table('users')
    .filter({ email })
    .run(req._rdbConn)
    .then(cursor => cursor.toArray())
    .then((result) => {
      if (result.length) {
        // If a user with email does exist, return an error
        res.status(422).send({ error: 'email is in use' });
      } else {
        genSalt(password)
          .then(salt => genHash(salt, password))
          .then((hash) => {
            // If a user with email does not exist, create and save user record
            const user = {
              email,
              password: hash,
            };

            user.createdAt = r.now();
            r.table('users')
              .insert(user, { returnChanges: true })
              .run(req._rdbConn)
              .then((saved) => {
                if (saved.inserted !== 1) {
                  return Promise.reject(new Error('Document was not inserted.'));
                }

                const createdUser = saved.changes[0].new_val;
                // Respond to request indicating user was created
                return res.json({ token: tokenForUser(createdUser) });
              })
              .catch(handleError(res));
          })
          .catch(handleError(res));
      }
    })
    .catch(handleError(res));
};
