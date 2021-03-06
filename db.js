// Load config for RethinkDB
const config = require('./config');
const r = require('rethinkdb');

module.exports = {
  /*
   * Middleware that will create a connection to the database
   * Create a RethinkDB connection, and save it in req._rdbConn
   */
  createConnection(req, res, next) {
    r
      .connect(config.rethinkdb)
      .then((conn) => {
        req._rdbConn = conn;
        next();
      })
      .error(err => next(err));
  },

  /*
   * Middleware to close a connection to the database
   * Close the RethinkDB connection
   */
  closeConnection(req) {
    req._rdbConn.close();
  },
};
