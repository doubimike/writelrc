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
    var id = req.params.id;
    Lrc.like(id, 1, function (err, lrc) {
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

router.get('/all', function (req, res, next) {
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

module.exports = router;
