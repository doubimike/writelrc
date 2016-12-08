var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config.json');

router.get('/', function (req, res) {
    res.render('register');
});

router.post('/', function (req, res) {
    console.log('req.body.captcha', req.body.captcha)
    console.log('req.session.captcha', req.session.captcha)
    if (req.body.captcha.toLowerCase() !== (req.session.captcha).toLowerCase()) {
        return res.render('register', {
            error: 'Captcha is not right!',
        });
    }
    // register using api to maintain clean separation between layers
    request.post({
        url: 'http://localhost:3001/user/register',
        form: req.body,
        json: true
    }, function (error, response, body) {
        console.log('error', error);
        console.log('body', body);
        console.log('response.body', response.body);
        // console.log('response', response)
        if (error) {
            return res.render('register', { error: 'An error occurred' });
        }

        if (response.statusCode !== 200) {
            return res.render('register', {
                error: JSON.stringify(response.body),
                // firstName: req.body.firstName,
                // lastName: req.body.lastName,
                // username: req.body.username
            });
        }

        // return to login page with success message
        req.session.success = 'Registration successful';
        return res.redirect('/login');
    });
});

module.exports = router;
