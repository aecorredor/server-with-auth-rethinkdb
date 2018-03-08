const r = require('rethinkdb');
const passport = require('passport');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local');
const { comparePassword } = require('../utils/bcryptHelpers');

// Create local strategy
const localOptions = {
  usernameField: 'email',
  passReqToCallback: true,
};
const localLogin = new LocalStrategy(localOptions, (req, email, password, done) => {
  // Verify this email and password, call done with the user
  // if it is the correct email and password
  // otherwise, call done with false
  r.table('users')
    .filter({ email })
    .run(req._rdbConn)
    .then(cursor => cursor.toArray())
    .then((result) => {
      if (!result.length) return done(null, false);

      // compare password - is `pasword` equal to user.password
      const user = result[0];
      return comparePassword(password, user.password)
        .then((isMatch) => {
          if (!isMatch) return done(null, false);
          return done(null, user);
        })
        .catch(err => done(err));
    })
    .catch(err => done(null, err));
});


// Set up options for JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret,
  passReqToCallback: true,
};

// Create JWT strategy
const jwtLogin = new JwtStrategy(jwtOptions, (req, payload, done) => {
  // See if the user ID in the payload exists in our database
  // If it does call 'done' with that user
  // otherwise, call 'done' without a user object
  r.table('users')
    .get(payload.sub)
    .run(req._rdbConn)
    .then((user) => {
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
});

// Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);

module.exports = {
  requireAuth: passport.authenticate('jwt', { session: false }),
  requireSignin: passport.authenticate('local', { session: false }),
};
