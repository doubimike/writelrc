var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');
var Lrc = require('../models/lrc');
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
    var md5 = crypto.createHash('md5');
    password = md5.update(req.body.password).digest('hex');
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
        User.findOne({ email: email }, '-password', function (err, user) {
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
                req.session.user = newUser;
                res.apiSuccess(user);
            });
        });
    });
});

router.post('/log', function (req, res, next) {
    var password = req.body.password;
    var email = req.body.email;
    var md5 = crypto.createHash('md5');
    password = md5.update(req.body.password).digest('hex');

    User.findOne({ email: email }).populate({
        path: 'msgBox',
        populate: {
            path: 'msgBox.content.authorId'
        }
    }).exec(function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(util.createApiError(40003, '没有这个用户'));
        }
        console.log('password', password)
        console.log('user', user)
        console.log('user.password', user.password)
        if (password != user.password) {
            return next(util.createApiError(40004, '密码错误'));
        }

        req.session.user = user;
        console.log('req.session.user', req.session.user);
        res.apiSuccess({
            name: user.name,
            email: user.email,
            head: user.head,
            _id: user._id,
            msgBox: user.msgBox
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


router.post('/user/intro', function (req, res, next) {
    var intro = req.body.intro;
    User.findById(req.session.user._id, function (err, user) {
        if (err) {
            return next(err);
        }
        user.intro = intro;
        user.save(function (err, user) {
            if (err) {
                return next(err);
            }
            res.apiSuccess({ msg: 'OK' });
        });
    });
});



router.post('/user/follow', function (req, res, next) {
    var id = req.body.id;
    var f = req.body.f;
    // f = false;

    var followerId = req.session.user._id;
    console.log('id', id)
    console.log('followerId', followerId)
    User.findById(followerId, function (err, user) {
        if (err) {
            return next(err);
        }
        console.log('f', f)
        console.log('user', user)
        if (!f) {
            user.followees.push(id);
        } else {
            var index = user.followees.indexOf(id);
            console.log('index', index)
            user.followees.splice(index, 1);
        }

        user.save(function (err, user) {
            if (err) {
                return next(err);
            }

            User.findById(id, function (err, user) {
                if (err) {
                    return next(err);
                }
                if (user) {
                    console.log('user2', user)
                    if (!f) {
                        user.followers.push(followerId);
                    } else {
                        var index = user.followers.indexOf(followerId);
                        user.followers.splice(index, 1);
                    }

                    user.save(function (err, user) {
                        if (err) {
                            return next(err);
                        }
                        res.apiSuccess({ msg: 'OK' });
                    })
                } else {
                    next();
                }
            })
        })
    })
})

router.put('/user/rename', function (req, res, next) {
    var newName = req.body.newName;
    console.log(newName);

    User.findByIdAndUpdate(req.session.user._id, { name: newName }, { new: true }, function (err, user) {
        if (err) {
            return next(err);
        }
        req.session.user = user;
        console.log('req.session.user', req.session.user);
        res.apiSuccess({
            name: user.name,
            email: user.email,
            head: user.head,
            _id: user._id
        });
    })
})


router.put('/user/resetpassword', function (req, res, next) {
    var newPass = req.body.newPass;
    var oldPass = req.body.oldPass;

    var md5 = crypto.createHash('md5');
    password = md5.update(oldPass).digest('hex');

    User.findById(req.session.user._id, function (err, user) {
        if (err) {
            return next(err);
        }

        if (password !== user.password) {
            return next(util.createApiError(40004, '老密码错误'));
        }
        var md5 = crypto.createHash('md5');
        newPass = md5.update(newPass).digest('hex');

        user.password = newPass;

        user.save(function (err, user) {
            if (err) {
                next(err);

            }
            req.session.user = user;
            res.apiSuccess({
                msg: 'OK'
            });
        })
    })
})

router.get('/user/followers', function (req, res, next) {
    var id = req.query.id;
    console.log(id)
    User.findById(id).populate('followers', '-password -email').exec(function (err, user) {

        if (err) {
            return next(err)
        };

        res.apiSuccess({ user: user });

    })
})


router.get('/user/followees', function (req, res, next) {
    var id = req.query.id;
    console.log(id)
    User.findById(id).populate('followees', '-password -email').exec(function (err, user) {

        if (err) {
            return next(err)
        };

        res.apiSuccess({ user: user });

    })
})

router.post('/user/msg/read', function (req, res, next) {
    var msgId = req.body.msgId;
    var userId = req.session.user._id;
    User.findById(userId, function (err, user) {
        if (err) {
            return next(err);

        }

        user.msgBox.id(msgId).readed = true;
        user.save(function (err, user) {
            if (err) {
                return next(err);

            }

            res.apiSuccess({ msg: 'OK' });
        })
    })
})



// 这个必须往最后放
router.get('/user/:id', function (req, res, next) {
    var userId = req.params.id;
    User.findById(userId, '-password', function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(util.createApiError(40003, '没有这个用户'));
        }
        Lrc.find({ author: userId }, function (err, lrcs) {
            if (err) {
                return next(err);
            }
            var likes = 0;
            var comments = 0;
            for (var i = 0; i < lrcs.length; i++) {
                likes += lrcs[i].likes;
                comments += lrcs[i].comments.length;
            }
            console.log('likes', likes)
                // user.likes = likes;
                // user.comments = comments;
                // console.log('user', user)
            res.apiSuccess({ user: user, lrcs: lrcs, likes: likes, comments: comments });
        });
    });
})

/* GET home page. */
router.get('/', function (req, res, next) {
    res.sendFile('../client/app/index.html');
});

module.exports = router;
