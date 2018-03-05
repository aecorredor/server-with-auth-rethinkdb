const Authentication = require('./controllers/authentication');
const { requireAuth, requireSignin } = require('./services/passport');

module.exports = function signUpRoute(app) {
  app.get('/', requireAuth, (req, res) => {
    res.send({ hi: 'there' });
  });

  app.post('/signin', requireSignin, Authentication.signIn);

  app.post('/signup', Authentication.signUp);

  app.get('*', (req, res, next) => {
    next(new Error('not found'));
  });
};
