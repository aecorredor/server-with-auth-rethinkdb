const Authentication = require('./controllers/authentication');
const { requireAuth, requireSignin } = require('./services/passport');

module.exports = function signUpRoute(app) {
  app.get('/', requireAuth, (req, res) => {
    res.send({ hi: 'there' });
  });

  app.post('/signin', requireSignin, Authentication.signin);

  app.post('/signup', Authentication.signup);
};
