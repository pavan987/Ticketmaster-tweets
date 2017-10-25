// import modules
const express = require('express')
const app = express()
const router = express.Router()
const dotenv = require('dotenv');
const logger = require('morgan');
const bodyParser = require("body-parser")
const errorHandler = require('errorhandler')
const tmcontroller = require('./controllers/tm_controller')
const flash = require('express-flash')
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const path = require('path');
const session = require('express-session')
const passport = require('passport');
// var mongoose = require('mongoose');

// set properties
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT']
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor())
app.use(logger('dev'));
app.use('/api/0.1', router)
app.use(errorHandler())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator())
dotenv.load({'path': '.env.ticketmaster'})
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


const auth = require('./auth/auth');

// connect db
//mongoose.connect('mongodb://localhost/passport-social-auth');

// routes
app.get("/", (req,res,next) => res.render("home"))
app.get("/event/:name", tmcontroller.getEventList)
app.get("/event/details/:id", tmcontroller.getEventInfo)
app.get("/auth/twitter", (req,res,next)=> {
    req.session.returnTo=req.query.redirecturi
    res.redirect("/auth/twit")})
app.get('/auth/twit', passport.authenticate('twitter'))
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/instagram', passport.authenticate('instagram', { scope: ['basic', 'public_content', 'follower_list', 'comments', 'relationships', 'likes'] } ));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});


app.get('/api/twitter/:keyword',  auth.isAuthorized,tmcontroller.getTwitter)
app.post('/api/twitter',  auth.isAuthorized,tmcontroller.postTwitter)
app.get('/api/instagram', auth.isAuthorized, tmcontroller.getInstagram)

app.get('*', function(req, res){
  res.send('Sorry Something went wrong. This page is not Available', 404);
});

// start server
app.listen(app.get('port'), () => {
    console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
  });

module.exports = app;
