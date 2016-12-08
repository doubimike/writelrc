var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');


router.post('/reg', function(req, res, next) {
    var name = req.body.name;
    var password = req.body.password;
    var md5 = crypto.createHash('md5');
    password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
        name: name,
        password: password
    });

    User.get(newUser.name, function(err, user) {
        if (err) {
            return res.send(err);
        }
        if (user) {
            return res.send('用户已存在');
        }
        newUser.save(function(err, user) {
            if (err) {
                return res.send(err);
            }

            req.session.user = user;
            res.send('注册成功');
        })
    })
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile('../client/app/index.html');
});

module.exports = router;
