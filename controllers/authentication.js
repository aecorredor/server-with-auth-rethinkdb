const r = require('rethinkdb');
const bcrypt = require('bcrypt-nodejs');

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide and email and a password' });
  }

  // See if a user with a given email exists
  r.table('users')
  .filter({ email })
  .run(req._rdbConn)
  .then(cursor => cursor.toArray())
  .then(result => {
    if (result.length) {
      // If a user with email does exist, return an error
      res.status(422).send({ error: 'email is in use' });
    } else {
      let encryptedPassword;
      genSalt(password)
      .then(({ salt, password }) => {
        genHash(salt, password);
      })
      .then(hash => {
        encryptedPassword = hash;
      })
      .catch(handleError(res));

      // If a user with email does not exist, create and save user record
      const user = {
        email,
        password: encryptedPassword,
      };

      user.createdAt = r.now();
      r.table('users')
      .insert(user, { returnChanges: true })
      .run(req._rdbConn)
      .then(result => {
        if (result.inserted !== 1) {
          res.status(500).send(new Error('Document was not inserted.'));
        } else {
          // Respond to request indicating user was created
          res.json(result.changes[0].new_val);
        }
      })
      .catch(handleError(res));;
    }
  })
  .catch(handleError(res));
}

/*
 * Send back a 500 error
 */
function handleError(res) {
  return function(error) {
    res.status(500).send({ error: error.message });
  }
}

const genSalt = password => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) reject(err);
      resolve({ salt, password });
    });
  });
}

const genHash = (salt, password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, salt, null, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
}