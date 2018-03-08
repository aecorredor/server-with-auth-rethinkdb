const r = require('rethinkdb');
const { genSalt, genHash } = require('../utils/bcryptHelpers');
const { tokenForUser } = require('../utils/jwtHelpers');

module.exports = {
  signIn: (req, res, next) => {
    // User has already had their email and password auth'd
    // We just need to give them a token
    res.send({ token: tokenForUser(req.user) });
  },

  signUp: (req, res, next) => {
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
                .catch(err => next(err));
            })
            .catch(err => next(err));
        }
      })
      .catch(err => next(err));
  },
};
