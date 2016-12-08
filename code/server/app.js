var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var mongoose = require('mongoose');
var hash = require('bcrypt-nodejs');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var compression = require('compression');
var ccap = require('ccap')();
var expressJwt = require('express-jwt');
var config = require('./config.json');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
// mongoose
mongoose.connect('mongodb://localhost/mean-auth');

// user schema/model
var User = require('./models/user.js');

var app = express();
app.use(compression());
var userRoutes = require('./routes/api.js');
var quoteRoutes = require('./routes/quote.js');
// app.set('view engine', 'html');
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// configure passport
passport.use(new localStrategy(User.authenticate(), { passReqToCallback: true }));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/home', function(req, res) {
    res.sendFile(__dirname + '/views/home.html');

})


// use JWT auth to secure the api
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register'] }));
// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));

app.get('/', function(req, res) {
    return res.redirect('/app');
});

// routes
app.get('/getCap/:id', function(req, res, next) {
    var ary = ccap.get();
    var captcha = ary[0];
    var buf = ary[1];
    req.session.captcha = captcha;
    console.log('req.session.captcha', captcha)

    res.send(buf);
});
app.use('/user/', userRoutes);
app.use('/quote/', quoteRoutes);
app.get('/forgot', function(req, res) {
    res.render('forgot', {
        user: req.user
    });
});
app.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    return res.render('forgot', { error: 'No account with that email address exists.' });
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                host: 'smtp.qq.com', // 主机
                secure: true, // 使用 SSL
                port: 465, // SMTP 端口
                auth: {
                    user: 'doubimike@qq.com', // 账号
                    pass: '' // 密码
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'doubimike@qq.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                    done(err, 'done');
                }
                res.render('forgot', { success: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

app.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            return res.render('forgot', { error: 'Password reset token is invalid or has expired.' });
        }
        res.render('reset', {
            user: req.user
        });
    });
});

app.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    return res.render('forgot', { error: 'Password reset token is invalid or has expired.' });
                }

                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                    req.logIn(user, function(err) {
                        done(err, user);
                    });
                });
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                host: 'smtp.qq.com', // 主机
                secure: true, // 使用 SSL
                port: 465, // SMTP 端口
                auth: {
                    user: 'doubimike@qq.com', // 账号
                    pass: '' // 密码
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'doubimike@qq.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                    done(err);
                }
                res.render('login', { success: 'Success! Your password has been changed.' });
            });
        }
    ], function(err) {
        res.redirect('/');
    });
});



/**
 * Development Settings
 */
if (app.get('env') === 'development') {
    // This will change in production since we'll be using the dist folder
    app.use(express.static(path.join(__dirname, '../client')));
    // This covers serving up the index page
    app.use(express.static(path.join(__dirname, '../client/.tmp')));
    app.use(express.static(path.join(__dirname, '../client/app')));

    // Error Handling
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
        // res.json({
        //     err: 'not right!'
        // });
    });
}

/**
 * Production Settings
 */
if (app.get('env') === 'production') {

    // changes it to use the optimized version for production
    app.use(express.static(path.join(__dirname, '/dist')));

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        // res.json({
        //     message: err.message,
        //     error: {}
        // });
        res.json({
            err: 'not right!'
        });
    });
}
module.exports = app;
