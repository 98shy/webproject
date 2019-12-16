const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const NaverStrategy = require('passport-naver').Strategy;
const User = require('../models/user');

module.exports = function(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) =>  {
    User.findById(id, done);
  });

  passport.use('local-signin', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  }, async (req, email, password, done) => {
    try {
      const user = await User.findOne({email: email});
      if (user && await user.validatePassword(password)) {
        return done(null, user, req.flash('success', '환영합니다!'));
      }
      return done(null, false, req.flash('danger', '이메일이나 비밀번호가 잘못되었습니다.'));
    } catch(err) {
      done(err);
    }
  }));

  passport.use(new FacebookStrategy({
    clientID : '2843401185873027',
    clientSecret : '219953c88dc11ae1ec6b4d1a55bb07ed',
    callbackURL : 'http://travelingproject.herokuapp.com/auth/facebook/callback',
    profileFields : ['email', 'name', 'picture']
  }, async (token, refreshToken, profile, done) => {
    console.log('Facebook', profile);
    try {
      var email = (profile.emails && profile.emails[0]) ? profile.emails[0].value : '';
      var picture = (profile.photos && profile.photos[0]) ? profile.photos[0].value : '';
      var name = (profile.displayName) ? profile.displayName : 
        [profile.name.givenName, profile.name.middleName, profile.name.familyName]
          .filter(e => e).join(' ');
      console.log(email, picture, name, profile.name);
      var user = await User.findOne({'facebook.id': profile.id});
      if (!user) {
        if (email) {
          user = await User.findOne({email: email});
        }
        if (!user) {
          user = new User({name: name});
          user.email =  email ? email : `__unknown-${user._id}@no-email.com`;
        }
        user.facebook.id = profile.id;
        user.facebook.photo = picture;
      }
      user.facebook.token = profile.token;
      await user.save();
      return done(null, user);
    } catch (err) {
      done(err);
    }
  }));

passport.use(new NaverStrategy({
  clientID : 'zaGnlcTWhtqlou3xU_jl',
  clientSecret : '5CcO4A3UZx',
  callbackURL : 'http://travelingproject.herokuapp.com/auth/naver/callback',
  profileFields : ['email', 'name', 'picture']
}, async (token, refreshToken, profile, done) => {
  console.log('Naver', profile);
  try {
    var email = (profile.emails && profile.emails[0]) ? profile.emails[0].value : '';
    var picture = (profile.photos && profile.photos[0]) ? profile.photos[0].value : '';
    var name = (profile.displayName) ? profile.displayName :
        [profile.name.givenName, profile.name.middleName, profile.name.familyName]
          .filter(e => e).join(' ');
    console.log(email, picture, name, profile.name);
    var user = await User.findOne({'naver.id': profile.id});
    if (!user) {
      if (email) {
        user = await User.findOne({email: email});
      }
      if (!user) {
        user = new User({name: name});
        user.email =  email ? email : `__unknown-${user._id}@no-email.com`;
      }
      user.naver.id = profile.id;
      user.naver.photo = picture;
    }
    user.naver.token = profile.token;
    await user.save();
    return done(null, user);
  } catch (err) {
    done(err);
  }
}));
};

