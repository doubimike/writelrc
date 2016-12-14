var router = require('express').Router();
var Lrc = require('../models/lrc');
var util = require('../util/index');
router.post('/write', function (req, res, next) {
    var title = req.body.title;
    var content = req.body.content;
    var bg = req.body.bg;
    var author = req.session.user.name;
    var publishTime = new Date();

    var lrc = new Lrc({
        title: title,
        content: content,
        bg: bg,
        author: author,
        publishTime: publishTime,
    });

    lrc.save(function (err, lrc) {
        if (err) {
            return next(err);
        };
        res.json({ lrc: lrc.ops[0] });
    });
})

router.post('/like/:id', function (req, res, next) {
    var user = req.session.user;
    var likeOrUnlike = req.body.likeOrUnlike;
    if (likeOrUnlike) {
        likeOrUnlike = 1;
    } else {
        likeOrUnlike = -1;
    }
    console.log('likeOrUnlike', likeOrUnlike);
    if (!user) {
        return next(util.createApiError(40006, '请登录'));
    }
    var id = req.params.id;
    Lrc.like(id, likeOrUnlike, function (err, lrc) {
        if (err) {
            return next(err);
        }
        if (!lrc) {
            return next(util.createApiError(40005, '没有这篇歌词'));
        }
        if (lrc) {
            return res.apiSuccess(lrc);
        }
    }, user._id);
});

router.get('/all', function (req, res, next) {
    console.log(Object.keys(req));
    // console.log(req.headers);
    Lrc.getAll(function (err, lrcs) {
        if (err) {
            res.next(err);
        } else {
            res.json({ lrcList: lrcs });
        }

    });
});

router.get('/detail/:id', function (req, res, next) {
    var id = req.params.id;
    Lrc.get(id, function (err, lrc) {
        if (err) {
            return next(err);
        }
        if (!lrc) {
            return next(util.createApiError(40005, '没有这篇歌词'));
        }
        if (lrc) {
            return res.send(lrc);
        }
    });
});

router.get('/test', function (req, res, next) {
    console.log('test')
    res.send('ok');
});

router.post('/comment', function (req, res, next) {
    var user = req.session.user;
    var lrcId = req.body.lrcId;
    var content = req.body.content;
    var userId = user._id;

    Lrc.comment(lrcId, content, userId, function (err, lrc) {

        if (err) {
            return next(err);
        }

        res.apiSuccess(lrc.comments);
    });
});

router.delete('/comment', function (req, res, next) {
    var user = req.session.user;
    var lrcId = req.query.lrcId;
    var comment = req.query.comment;
    console.log('lrcId', lrcId)
    console.log('comment', comment)
    Lrc.deleteComment(lrcId, comment, function (err, lrc) {
        console.log('err', err)
        if (err) {
            return next(err);
        }
        if (!lrc) {
            return next(util.createApiError(40005, '没有这篇歌词'));
        }
        if (lrc) {
            return res.apiSuccess(lrc.comments);
        }


    });
});


module.exports = router;
