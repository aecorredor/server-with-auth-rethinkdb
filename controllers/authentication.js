const r = require('rethinkdb');

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

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
      // If a user with email does not exist, create and save user record
      const user = {
        email,
        password,
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