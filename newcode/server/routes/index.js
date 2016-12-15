var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');

var util = require('../util');
router.post('/reg', function (req, res, next) {
    var name = req.body.name;
    var password = req.body.password;
    var email = req.body.email;
    var md5 = crypto.createHash('md5');
    password = md5.update(req.body.password).digest('hex');

    var newUser = new User({
        name: name,
        password: password,
        email: email
    });

    User.get(newUser.name, newUser.email, function (err, user, userEmail) {
        if (err) {
            return next(err);
        }
        if (user) {
            return next(util.createApiError(40001, '用户已存在'));
        }
        if (userEmail) {
            return next(util.createApiError(40002, '邮箱已注册'));
        }
        newUser.save(function (err, user) {
            if (err) {
                return res.next(err);
            }
            req.session.user = user;
            res.apiSuccess({ name: user.name, email: user.email, head: user.head, _id: user._id });
        });
    });
});

router.post('/log', function (req, res, next) {
    var password = req.body.password;
    var email = req.body.email;
    var md5 = crypto.createHash('md5');
    password = md5.update(req.body.password).digest('hex');

    User.login(email, password, function (err, user) {
        if (err) {
            return next(err);
        }
        req.session.user = user;
        res.apiSuccess({
            name: user.name,
            email: user.email,
            head: user.head,
            _id: user._id
        });
    });
});

router.get('/logout', function (req, res, next) {
    if (req.session.user) {
        delete req.session.user;
    }
    res.apiSuccess({ 'msg': 'OK' });
});

router.post('/forgotPass', function (req, res, next) {
    var email = req.body.email;
    // 接下来应该是发送一封邮件
    sendEmail(email).then(function () {
        res.apiSuccess({ 'msg': '发送成功' });
    }, function (data) {
        console.log(data);
    });
});



/* GET home page. */
router.get('/', function (req, res, next) {
    res.sendFile('../client/app/index.html');
});

module.exports = router;
