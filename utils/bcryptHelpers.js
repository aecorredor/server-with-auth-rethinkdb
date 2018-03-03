const bcrypt = require('bcrypt-nodejs');

module.exports = {
  comparePassword: (candidatePassword, actualPassword) => (
    new Promise((resolve, reject) => {
      bcrypt.compare(candidatePassword, actualPassword, (err, isMatch) => {
        if (err) reject(err);
        resolve(isMatch);
      });
    })
  ),
};
