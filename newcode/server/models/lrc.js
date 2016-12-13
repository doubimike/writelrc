var mongodb = require('./db');
var async = require('async');
var ObjectId = require('mongodb').ObjectId;

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
    this.comments = [];
}

Lrc.prototype.save = function (callback) {
    var lrc = this;
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            })
        },
        function (db, cb) {
            db.collection('lrc', function (err, collection) {
                cb(err, collection);
            })
        },
        function (collection, cb) {
            collection.insert(lrc, { safe: true }, function (err, lrc) {
                cb(err, lrc);
            })
        }
    ], function (err, lrc) {
        mongodb.close();
        callback(err, lrc);
    })
};

Lrc.get = function (id, callback) {
    try {
        var id = new ObjectId(id);
    } catch (err) {
        return callback(err);
    }
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            })
        },
        function (db, cb) {
            db.collection('lrc', function (err, collection) {
                cb(err, collection);
            })
        },
        function (collection, cb) {
            collection.findOne({ _id: id }, function (err, lrc) {
                console.log(err)
                cb(err, lrc, collection);
            })
        },
        function (lrc, collection, cb) {
            lrc.views += 1;
            collection.save(lrc, function (err) {
                cb(err, lrc);
            });
        }
    ], function (err, lrc) {
        mongodb.close();
        return callback(err, lrc);
    });
}

Lrc.like = function (id, likeOrUnlike, callback, userId) {
    try {
        var id = new ObjectId(id);
    } catch (err) {
        return callback(err);
    }
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            })
        },
        function (db, cb) {
            db.collection('lrc', function (err, collection) {
                cb(err, collection);
            })
        },
        function (collection, cb) {
            collection.findOne({ _id: id }, function (err, lrc) {
                console.log(err)

                cb(err, lrc, collection);
            })
        },
        function (lrc, collection, cb) {
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
            collection.save(lrc, function (err) {
                cb(err, lrc);
            });

        }
    ], function (err, lrc) {
        mongodb.close();
        return callback(err, lrc);
    });
};

Lrc.getAll = function (callback) {
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection('lrc', function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            collection.find().toArray(function (err, lrcs) {
                cb(err, lrcs);
            });
        }
    ], function (err, lrcs) {
        mongodb.close();
        return callback(err, lrcs);
    });
};

Lrc.comment = function (lrcId, content, userName, callback) {
    try {
        var id = new ObjectId(lrcId);
    } catch (err) {
        return callback(err);
    }
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            })
        },
        function (db, cb) {
            db.collection('lrc', function (err, collection) {
                cb(err, collection);
            })
        },
        function (collection, cb) {

            collection.findOne({ _id: id }, function (err, lrc) {
                cb(err, lrc, collection);
            })
        },
        function (lrc, collection, cb) {
            console.log('lrc', lrc)
            if (lrc) {
                var comment = {
                    authorName: userName,
                    content: content,
                    commentTime: new Date()

                };
                lrc.comments.push(comment);
                collection.save(lrc, function (err) {
                    cb(err, lrc);
                });
            } else {
                cb(null, lrc);

            }


        }
    ], function (err, lrc) {
        mongodb.close();
        return callback(err, lrc);
    });
};

module.exports = Lrc;
