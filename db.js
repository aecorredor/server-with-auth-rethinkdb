// Load config for RethinkDB
const config = require(`${__dirname}/config.js`);

const r = require('rethinkdb');

module.exports = {
  /*
   * Middleware that will create a connection to the database
   * Create a RethinkDB connection, and save it in req._rdbConn
   */
  createConnection: function (req, res, next) {
    r.connect(config.rethinkdb)
    .then(function(conn) {
      req._rdbConn = conn;
      next();
    })
    .error(handleError(res));
  },

  /*
   * Middleware to close a connection to the database
   * Close the RethinkDB connection
   */
  closeConnection: function (req, res, next) {
    req._rdbConn.close();
  },
}

/*
 * Send back a 500 error
 */
function handleError(res) {
  return function(error) {
    res.status(500).send({ error: error.message });
  }
}