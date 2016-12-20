var router = require('express').Router();
var Lrc = require('../models/lrc');
var User = require('../models/user');
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

        lrc.save(function (err, lrc) {
            if (err) {
                return next(err);
            };

            res.json({ lrc: lrc });
        });
    });

});

router.put('/write', function (req, res, next) {

    var ip = util.getClientIP(req);
    var url = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip=' + '192.152.3.25';
    request(url, function (error, response, body) {
        var bodyObj = JSON.parse(body);
        var city = bodyObj.province;
        var title = req.body.title;
        var content = req.body.content;
        var bg = req.body.bg;
        var id = req.body.id;
        if (!req.session.user) {
            return next(util.createApiError(40006, '请登录'));
        }
        var author = req.session.user._id;

        // var lrc = new Lrc({
        //     title: title,
        //     content: content,
        //     bg: bg,
        //     author: author,
        //     pubPlace: city
        // });

        // lrc.save(function(err, lrc) {
        //     if (err) {
        //         return next(err);
        //     };

        //     res.json({ lrc: lrc });
        // });

        Lrc.findByIdAndUpdate(id, { city: city, title: title, content: content, updateTime: new Date() }, function (err, lrc) {
            res.json({ lrc: lrc });
        })
    });

});




router.post('/delete', function (req, res, next) {
    var deleteId = req.body.id;
    Lrc.findById(deleteId, function (err, lrc) {
        console.log('req.session.user._id', typeof req.session.user._id)
        console.log('lrc.author', typeof lrc.author)
        console.log(req.session.user._id !== lrc.author)
        if (req.session.user._id !== lrc.author.toString()) {
            return next(util.createApiError(40007, '没有权限'));
        }
        lrc.remove(function (err) {
            if (err) {
                next(err);
            }
            res.apiSuccess({ msg: 'OK' });
        })
    })
})

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

            User.findById(lrc.author, function (err, user) {
                var msg = {
                    type: '喜欢',
                    content: {
                        lrcId: lrc._id,
                        lrc: lrc,
                        likeId: userId,
                    },
                };

                user.msgBox.push(msg);

                user.save(function (err, user) {
                    if (err) {
                        return next(err);
                    }

                    lrc.save(function (err, lrc) {
                        if (err) {
                            return next(err);
                        }
                        res.apiSuccess({ lrc: lrc });
                    });
                });
            });
        } else if (likeOrUnlike == -1) {
            var index = lrc.likeIds.indexOf(userId);
            lrc.likeIds.splice(index, 1);
            lrc.likes -= 1;
            lrc.save(function (err, lrc) {
                if (err) {
                    return next(err);
                }
                res.apiSuccess({ lrc: lrc });
            });
        }

    });
});

router.post('/collect/:id', function (req, res, next) {
    var userId = req.session.user._id;
    var collectOrUncollect = req.body.collectOrUncollect;
    if (collectOrUncollect) {
        collectOrUncollect = 1;
    } else {
        collectOrUncollect = -1;
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
        User.findById(userId, function (err, user) {
            if (err) {
                return next(err);
            }
            if (collectOrUncollect == 1) {
                lrc.collectIds.push(userId);
                user.collects.push(lrc._id);
                lrc.collects += 1;
            } else if (collectOrUncollect == -1) {
                var index = lrc.collectIds.indexOf(userId);
                var lrcIndex = user.collects.indexOf(id);
                lrc.collectIds.splice(index, 1);
                user.collects.splice(lrcIndex, 1);
                lrc.collects -= 1;
            }
            lrc.save(function (err, lrc) {
                if (err) {
                    return next(err);
                }
                user.save(function (err, user) {
                    if (err) {
                        return next(err);
                    }
                    res.apiSuccess({ lrc: lrc });
                });
            });
        })

    });
});

router.get('/collects', function (req, res, next) {
    var userId = req.session.user._id;
    User.findById(userId, '-password -email').populate({ path: 'collects', select: '' }).exec(function (err, user) {
        res.apiSuccess({ lrcs: user.collects })
    })
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
        select: 'name head'
    }).populate({
        path: 'comments',
        select: 'content commentTime authorId',
        populate: {
            path: 'authorId',
            select: 'name head',
        },
        options: { sort: { '_id': -1 }, limit: 10 }
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
    var replyToId = req.body.authorId;
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
            // lrc.commentsCount += 1;
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

                    User.findById(lrc.author, function (err, user) {
                        if (err) {
                            return next(err);
                        }
                        console.log('comment', comment)
                        var msg = {
                            type: '评论',
                            content: comment,
                            author: comment.authorId.name
                        };

                        user.msgBox.push(msg);
                        console.log('user.msgBox', user.msgBox);


                        user.save(function (err, user) {
                            if (err) {
                                return next(err);
                            }
                            // 如果是回复，发送通知到被回复的人
                            console.log('replyToId !== lrc.author', replyToId !== lrc.author)
                            console.log('replyToId ', replyToId)
                            console.log('replyToId ', replyToId)
                            console.log('lrc.author ', lrc.author)
                            if (replyToId && replyToId !== lrc.author) {
                                User.findById(replyToId, function (err, user) {
                                    if (err) {
                                        return next(err);
                                    }
                                    var msg = {
                                        type: '回复',
                                        content: comment,
                                        author: comment.authorId.name
                                    };

                                    user.msgBox.push(msg);

                                    user.save(function (err) {
                                        if (err) {
                                            return next(err);
                                        }
                                    });
                                });
                            }

                            if (comment) {
                                res.apiSuccess(comment);
                            }
                        });
                    });
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
    console.log('user,user', user)
    if (user) {
        Lrc.find({ author: user._id }, function (err, lrcs) {
            if (err) {
                return next(err);
            }
            res.apiSuccess({ lrcs: lrcs });
        });
    } else {
        next(util.createApiError(40006, '请登录'));
    }
});

router.post('/loadMoreComment', function (req, res, next) {
    var beginIndex = req.body.index;
    console.log('beginIndex', beginIndex)
    var lrcId = req.body.lrcId;
    Comment.find({ lrcId: lrcId }).sort({ commentTime: -1 }).skip(beginIndex).limit(10).populate({
        path: 'authorId',
        select: 'name head _id'
    }).exec(function (err, comments) {
        res.apiSuccess({ comments: comments });
    });
})

router.post('/search', function (req, res, next) {
    var search = req.body.search;
    if (search) {
        Lrc.find({ $or: [{ 'content': new RegExp(search, 'i') }, { 'bg': new RegExp(search, 'i') }, { 'title': new RegExp(search, 'i') }] }, function (err, lrcs) {
            if (err) {
                return next(err);
            }

            res.apiSuccess({ lrcs: lrcs });

        });
    } else {
        res.apiSuccess({ lrcs: [] });
    }
});

module.exports = router;
