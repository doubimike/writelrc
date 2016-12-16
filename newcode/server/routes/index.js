var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');
var request = require('request');

var util = require('../util');
router.get('/test', function (req, res, next) {
    var ip = util.getClientIP(req);
    var url = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip=' + '192.152.3.25';
    request(url, function (error, response, body) {
        console.log('url', url);
        var bodyObj = JSON.parse(body);
        var city = bodyObj.province;
        console.log(typeof body);
        console.log('city', city);

        res.send(city);
    });

});

router.post('/reg', function (req, res, next) {
    var name = req.body.name;
    var password = req.body.password;
    var email = req.body.email;
    var newUser = new User({
        name: name,
        password: password,
        email: email
    });
    // 开始查询
    User.findOne({ name: name }, function (err, user) {
        if (err) {
            return next(err);
        }
        if (user) {
            return next(util.createApiError(40001, '用户已存在'));
        }
        User.findOne({ email: email },
            function (err, user) {
                if (err) {
                    return next(err);
                }
                if (user) {
                    return next(util.createApiError(40002, '邮箱已注册'));
                }
                newUser.save(function (err, user) {
                    if (err) {
                        return next(err);
                    }
                    res.apiSuccess(user);
                });
            }
        );
    });
});

router.post('/log', function (req, res, next) {
    var password = req.body.password;
    var email = req.body.email;
    var md5 = crypto.createHash('md5');
    password = md5.update(req.body.password).digest('hex');

    User.findOne({ email: email }, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(util.createApiError(40003, '没有这个用户'));
        }
        if (password != user.password) {
            return next(util.createApiError(40004, '密码错误'));
        }

        req.session.user = user;
        console.log('req.session.user', req.session.user);
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
