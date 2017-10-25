const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
// const InstagramStrategy = require('passport-instagram').Strategy;

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: '/auth/twitter/callback',
  passReqToCallback: true
},
(req,token, tokenSecret, profile, cb) => {
    let twitter = {
      token,
      tokenSecret,
      profile
    }
    if(req.user){
      req.user.twitter=twitter
      return cb(null,req.user)
    }
    else{
      return cb(null, {twitter});
    }
}))


// passport.use(new InstagramStrategy({
//   clientID: process.env.INSTAGRAM_ID,
//   clientSecret: process.env.INSTAGRAM_SECRET,
//   callbackURL: '/auth/instagram/callback',
//   passReqToCallback: true
// }, (req,accessToken, refreshToken, profile, cb) => {
//       let instagram = {
//         accessToken,
//         refreshToken,
//         profile
//       }
//     if(req.user){
//       req.user.instagram=instagram
//       return cb(null,req.user)
//     }
//     else{
//       return cb(null, {instagram});
//     }
// }))


// exports.isAuthenticated = (req, res, next) => {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   //res.redirect('/auth/twitter');
//   res.send("not authenticated")
// }

exports.isAuthorized = (req, res, next) => {
  //const provider = req.path.split('/').slice(-2)[0]
  // if (req.user && req.user[provider]) {
  if(req.user){
    next()
  } else {
    res.status(403).json({ error: 'Unauthorized, Please login to twitter' })
  }
}



  


