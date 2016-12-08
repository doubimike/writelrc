var express = require('express');
var router = express.Router();
var passport = require('passport');
var log4js = require('log4js');
var logger = log4js.getLogger();
var User = require('../models/user.js');
var Q = require('q');
var jwt = require('jsonwebtoken');
var config = require('../config.json');


router.post('/register', function(req, res) {
    // console.log('req.body', req.body)
    // console.log('req.body.captcha', req.body.captcha)
    // console.log('req.session.captcha', req.session.captcha)
    // console.log('req.session', req.session)
    User.register(new User({ username: req.body.username, email: req.body.email }),
        req.body.password,
        function(err, account) {
            if (err) {
                return res.status(500).json({
                    err: err
                });
            }
            passport.authenticate('local')(req, res, function() {
                return res.status(200).json({
                    status: 'Registration successful!'
                });
            });
        });
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.send({
                    err: 'Could not log in user'
                });
            }
            return res.send({
                token: jwt.sign({ sub: user._id }, config.secret)
            });
        });
    })(req, res, next);
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});

router.get('/status', function(req, res) {
    if (!req.isAuthenticated()) {
        return res.status(200).json({
            status: false
        });
    }
    res.status(200).json({
        status: true
    });
});




module.exports = router;
