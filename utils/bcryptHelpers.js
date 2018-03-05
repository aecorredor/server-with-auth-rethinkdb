const bcrypt = require('bcrypt-nodejs');

module.exports = {
  genSalt: () => (
    new Promise((resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) reject(err);
        resolve(salt);
      });
    })
  ),

  genHash: (salt, password) => (
    new Promise((resolve, reject) => {
      bcrypt.hash(password, salt, null, (err, hash) => {
        if (err) reject(err);
        resolve(hash);
      });
    })
  ),

  comparePassword: (candidatePassword, actualPassword) => (
    new Promise((resolve, reject) => {
      bcrypt.compare(candidatePassword, actualPassword, (err, isMatch) => {
        if (err) reject(err);
        resolve(isMatch);
      });
    })
  ),
};
