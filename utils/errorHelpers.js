/*
 * Send back a 500 error
 */
module.exports = {
  handleError: res => (
    function genError(error) {
      res.status(500).send({ error: error.message });
    }
  ),
};
