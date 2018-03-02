const r = require('rethinkdb');
const bcrypt = require('bcrypt-nodejs');

/*
 * Send back a 500 error
 */
function handleError(res) {
  return function genError(error) {
    res.status(500).send({ error: error.message });
  };
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

                // Respond to request indicating user was created
                return res.json(saved.changes[0].new_val);
              })
              .catch(handleError(res));
          })
          .catch(handleError(res));
      }
    })
    .catch(handleError(res));
};
