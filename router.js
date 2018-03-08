const Authentication = require('./controllers/authentication');
const { requireAuth, requireSignin } = require('./services/passport');

module.exports = function signUpRoute(app) {
  app.get('/', requireAuth, (req, res, next) => {
    res.send({ hi: 'there' });
  });

  app.post('/signin', requireSignin, Authentication.signIn);

  app.post('/signup', Authentication.signUp);

  app.get('*', (req, res, next) => {
    const error = new Error('Resource does not exist.');
    error.statusCode = 404;
    next(error);
  });
};
