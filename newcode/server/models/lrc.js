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
            collection.findOne({ _id: id }, function(err, lrc) {
                console.log(err)
                cb(err, lrc, collection);
            })
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

Lrc.like = function(id, likeOrUnlike, callback) {
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
            if (likeOrUnlike == 1) {
                lrc.likes += 1;
            } else if (likeOrUnlike == -1) {
                lrc.likes -= 1;
            }
            collection.save(lrc, function(err) {
                cb(err, lrc);
            });
        }
    ], function(err, lrc) {
        mongodb.close();
        return callback(err, lrc);
    });
}

Lrc.getAll = function(callback) {
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
            collection.find(function(err, lrcs) {
                console.log(err)
                cb(err, lrcs);
            })
        }
    ], function(err, lrcs) {
        mongodb.close();
        return callback(err, lrcs);
    });
}

module.exports = Lrc;
