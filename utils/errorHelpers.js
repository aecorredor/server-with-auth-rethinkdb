/*
 * Send back a 500 error
 */
module.exports = {
  errorHandler: (err, req, res, next) => {
    let error = err;
    if (!error.statusCode) {
      error = { ...error, statusCode: 500 };
    }

    res.status(error.statusCode).send(error.message);
    return next();
  },
};
