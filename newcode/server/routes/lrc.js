var router = require('express').Router();
var Lrc = require('../models/lrc');
var Comment = require('../models/comment');
var util = require('../util');
var request = require('request');
router.post('/write', function (req, res, next) {

    var ip = util.getClientIP(req);
    var url = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip=' + '192.152.3.25';
    request(url, function (error, response, body) {
        var bodyObj = JSON.parse(body);
        var city = bodyObj.province;

        var title = req.body.title;
        var content = req.body.content;
        var bg = req.body.bg;
        console.log(req.session.user);
        if (!req.session.user) {
            return next(util.createApiError(40006, '请登录'));
        }
        var author = req.session.user._id;

        var lrc = new Lrc({
            title: title,
            content: content,
            bg: bg,
            author: author,
            pubPlace: city
        });
        console.log('lrc', lrc);

        lrc.save(function (err, lrc) {
            if (err) {
                return next(err);
            };
            res.json({ lrc: lrc });
        });
    });

});

router.post('/like/:id', function (req, res, next) {
    var userId = req.session.user._id;
    var likeOrUnlike = req.body.likeOrUnlike;
    if (likeOrUnlike) {
        likeOrUnlike = 1;
    } else {
        likeOrUnlike = -1;
    }

    if (!userId) {
        return next(util.createApiError(40006, '请登录'));
    }

    var id = req.params.id;
    Lrc.findById(id, function (err, lrc) {
        if (err) {
            return next(err);
        }
        if (!lrc) {
            return next(util.createApiError(40005, '没有这篇歌词'));
        }
        if (likeOrUnlike == 1) {
            lrc.likeIds.push(userId);
            lrc.likes += 1;
        } else if (likeOrUnlike == -1) {
            var index = lrc.likeIds.indexOf(userId);
            lrc.likeIds.splice(index, 1);
            lrc.likes -= 1;
        }
        lrc.save(function (err, lrc) {
            if (err) {
                return next(err);
            }
            res.apiSuccess({ lrc: lrc });
        });
    });
});

router.get('/all', function (req, res, next) {
    console.log(Object.keys(req));
    // console.log(req.headers);
    Lrc.find({}).populate({
        path: 'author',
        select: 'name head -_id'
    }).exec(function (err, lrcs) {
        if (err) {
            res.next(err);
        } else {
            res.json({ lrcList: lrcs });
        }
    });
});

router.get('/detail/:id', function (req, res, next) {
    var id = req.params.id;
    Lrc.findById(id).populate({
        path: 'author',
        select: 'name head -_id'
    }).populate({
        path: 'comments',
        select: 'content commentTime authorId',
        populate: {
            path: 'authorId',
            select: 'name head -_id'
        },
        options: { sort: { '_id': -1 } }
    }).exec(function (err, lrc) {
        if (err) {
            return next(err);
        }
        if (!lrc) {
            return next(util.createApiError(40005, '没有这篇歌词'));
        }
        if (lrc) {
            lrc.views += 1;
            lrc.save(function (err, lrc) {
                if (err) {
                    return next(err);
                }
                return res.send(lrc);
            });
        }
    });
});

router.post('/comment', function (req, res, next) {
    var user = req.session.user;
    var lrcId = req.body.lrcId;
    var content = req.body.content;
    var userId = user._id;
    var comment = new Comment({
        authorId: userId,
        content: content,
        lrcId: lrcId
    });
    comment.save(function (err, comment) {
        if (err) {
            return next(err);
        }
        Lrc.findById(lrcId, function (err, lrc) {
            if (err) {
                return next(err);
            }
            lrc.comments.push(comment._id);
            lrc.save(function (err, lrc) {
                if (err) {
                    return next(err);
                }
                Comment.findById(comment._id).populate({
                    path: 'authorId',
                    select: 'name head _id'
                }).exec(function (err, comment) {

                    if (err) {
                        return next(err);
                    }
                    if (comment) {
                        res.apiSuccess(comment);
                    }
                });
            });
        });

    });
});

router.delete('/comment', function (req, res, next) {
    var user = req.session.user;
    var lrcId = req.query.lrcId;
    var comment = JSON.parse(req.query.comment);
    console.log('comment', comment._id);
    console.log('typeof comment', typeof comment);

    Comment.findByIdAndRemove(comment._id, function (err) {
        if (err) {
            return next(err);
        }
        return res.apiSuccess({ msg: 'OK' });
    });
    // Lrc.deleteComment(lrcId, comment, function (err, lrc) {
    //     console.log('err', err)
    //     if (err) {
    //         return next(err);
    //     }
    //     if (!lrc) {
    //         return next(util.createApiError(40005, '没有这篇歌词'));
    //     }
    //     if (lrc) {
    //         return res.apiSuccess(lrc.comments);
    //     }
    // });
});

router.get('/mine', function (req, res, next) {
    var user = req.session.user;
    Lrc.find({ author: user._id }, function (err, lrcs) {
        if (err) {
            return next(err);
        }
        res.apiSuccess({ lrcs: lrcs });
    });
});


module.exports = router;
