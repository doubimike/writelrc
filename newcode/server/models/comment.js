var mongodb = require('./db');
var async = require('async');

function Comment(comment) {
    this.authorId = comment.authorId;
    this.content = comment.content;
    this.commentTime = new Date();
    this.lrcId = comment.lrcId
}

Comment.prototype.save = function (db, callback) {
    var comment = this;
    async.waterfall([
        // function (cb) {
        //     mongodb.open(function (err, db) {
        //         cb(err, db);
        //     })
        // },
        function (cb) {
            db.collection('comment', function (err, collection) {
                cb(err, collection);
            })
        },
        function (collection, cb) {
            collection.insert(comment, { safe: true }, function (err, comment) {
                cb(err, comment.ops[0], collection);
            })
        }
    ], function (err, comment, collection) {
        // mongodb.close();
        callback(err, comment, collection);
    })
}

module.exports = Comment;
