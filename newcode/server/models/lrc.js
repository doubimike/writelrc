var mongodb = require('./db');
var async = require('async');
var ObjectId = require('mongodb').ObjectId;
var Comment = require('./comment');

function Lrc(lrc) {
    this.title = lrc.title;
    this.content = lrc.content;
    this.bg = lrc.bg;
    this.author = lrc.author;
    this.publishTime = lrc.publishTime;
    this.views = 0;
    this.likes = 0;
    this.likeIds = [];
    this.collects = 0;
    // this.comments = [];
}

Lrc.prototype.save = function(callback) {
    var lrc = this;
    async.waterfall([
        function(cb) {
            mongodb.open(function(err, db) {
                cb(err, db);
            })
        },
        function(db, cb) {
            db.collection('lrc', function(err, collection) {
                cb(err, collection);
            })
        },
        function(collection, cb) {
            collection.insert(lrc, { safe: true }, function(err, lrc) {
                cb(err, lrc);
            })
        }
    ], function(err, lrc) {
        mongodb.close();
        callback(err, lrc);
    })
};

Lrc.get = function(id, callback) {
    try {
        var id = new ObjectId(id);
    } catch (err) {
        return callback(err);
    }
    async.waterfall([
        function(cb) {
            mongodb.open(function(err, db) {
                cb(err, db);
            })
        },
        function(db, cb) {
            db.collection('lrc', function(err, collection) {
                cb(err, collection);
            })
        },
        function(collection, cb) {
            collection.aggregate([{
                    $match: { _id: id }
                }, {
                    $lookup: {
                        from: 'comment',
                        localField: '_id',
                        foreignField: 'lrcId',
                        as: 'comments'
                    }
                }, {
                    $unwind: '$comments'
                }, {
                    $lookup: {
                        from: 'user',
                        localField: 'comments.authorId',
                        foreignField: '_id',
                        as: 'authorInfo'
                    }
                }

                // , {
                //                 $lookup: {
                //                     from: 'user',
                //                     localField: 'comments.authorId',
                //                     foreignField: '_id',
                //                     as: 'comments'
                //                 }
                //             }

            ], function(err, lrc) {
                console.log('err aggregate', err)
                console.log('lrc', lrc)
                cb(err, lrc[0], collection);
            });

            // collection.findOne({ _id: id }, function (err, lrc) {
            //     console.log(err)
            //     cb(err, lrc, collection);
            // })
        },
        function(lrc, collection, cb) {
            lrc.views += 1;
            collection.save(lrc, function(err) {
                cb(err, lrc);
            });
        }
    ], function(err, lrc) {
        mongodb.close();
        return callback(err, lrc);
    });
}


Lrc.like = function(id, likeOrUnlike, callback, userId) {
    try {
        var id = new ObjectId(id);
    } catch (err) {
        return callback(err);
    }
    async.waterfall([
        function(cb) {
            mongodb.open(function(err, db) {
                cb(err, db);
            })
        },
        function(db, cb) {
            db.collection('lrc', function(err, collection) {
                cb(err, collection);
            })
        },
        function(collection, cb) {
            collection.findOne({ _id: id }, function(err, lrc) {
                console.log(err)

                cb(err, lrc, collection);
            })
        },
        function(lrc, collection, cb) {
            console.log('lrc', lrc)
            if (lrc) {
                if (likeOrUnlike == 1) {
                    lrc.likeIds.push(userId)
                    console.log('lrc.likeIds', lrc.likeIds)

                    lrc.likes += 1;
                } else if (likeOrUnlike == -1) {
                    var index = lrc.likeIds.indexOf(userId);
                    console.log('index', index);
                    lrc.likeIds.splice(index, 1);
                    lrc.likes -= 1;
                }
            }
            collection.save(lrc, function(err) {
                cb(err, lrc);
            });

        }
    ], function(err, lrc) {
        mongodb.close();
        return callback(err, lrc);
    });
};

Lrc.getAll = function(callback) {
    async.waterfall([
        function(cb) {
            mongodb.open(function(err, db) {
                cb(err, db);
            });
        },
        function(db, cb) {
            db.collection('lrc', function(err, collection) {
                cb(err, collection);
            });
        },
        function(collection, cb) {
            collection.find().toArray(function(err, lrcs) {
                cb(err, lrcs);
            });
        }
    ], function(err, lrcs) {
        mongodb.close();
        return callback(err, lrcs);
    });
};

Lrc.comment = function(lrcId, content, userId, callback) {
    try {
        var id = new ObjectId(lrcId);
    } catch (err) {
        return callback(err);
    }
    async.waterfall([
        function(cb) {
            mongodb.open(function(err, db) {
                cb(err, db);
            })
        },
        function(db, cb) {
            db.collection('lrc', function(err, collection) {
                cb(err, collection, db);
            })
        },
        function(collection, db, cb) {

            collection.findOne({ _id: id }, function(err, lrc) {
                cb(err, lrc, collection, db);
            })
        },
        function(lrc, collection, db, cb) {
            if (lrc) {
                var comment = new Comment({
                    authorId: new ObjectId(userId),
                    content: content,
                    commentTime: new Date(),
                    lrcId: id
                });

                comment.save(db, function(err, comment, CommentCollection) {
                    if (err) {
                        cb(err);
                    } else {
                        lrc.comments.splice(0, 0, comment._id);
                        // 只返回comment

                        collection.save(lrc, function(err) {
                            CommentCollection.find({ '_id': { '$in': lrc['comments'] } }).toArray(function(err, result) {
                                console.log('result', result);
                                cb(err, result);
                            });
                        });
                    }
                });
            } else {
                cb(null, lrc);
            }
        }
    ], function(err, lrc) {
        mongodb.close();
        return callback(err, lrc);
    });
};

Lrc.deleteComment = function(lrcId, comment, callback) {
    try {
        var id = new ObjectId(lrcId);
    } catch (err) {
        return callback(err);
    }
    async.waterfall([
        function(cb) {
            mongodb.open(function(err, db) {
                cb(err, db);
            })
        },
        function(db, cb) {
            db.collection('lrc', function(err, collection) {
                cb(err, collection);
            })
        },
        function(collection, cb) {
            collection.findOne({ _id: id }, function(err, lrc) {
                console.log(err)

                cb(err, lrc, collection);
            })
        },
        function(lrc, collection, cb) {
            console.log('lrc', lrc)
            if (lrc) {
                comment = JSON.parse(comment);
                comment.commentTime = new Date(comment.commentTime);
                console.log('comment', comment)
                var index = lrc.comments.indexOf(comment);
                console.log('index', index);
                if (index > 0) {
                    lrc.comments.splice(index, 1);
                }

                collection.save(lrc, function(err) {
                    cb(err, lrc);
                });
            } else {
                cb(null, lrc);
            }


        }
    ], function(err, lrc) {
        mongodb.close();

        return callback(err, lrc);
    });
}

module.exports = Lrc;
