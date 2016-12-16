var mongodb = require('./db');
var async = require('async');
var ObjectId = require('mongodb').ObjectId;
var Comment = require('./comment');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var lrcSchema = new mongoose.Schema({
    title: { type: String, require: true },
    content: { type: String, require: true },
    bg: String,
    author: { type: mongoose.Schema.ObjectId, require: true, ref: 'User' },
    publishTime: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    bg: String,
    likes: { type: Number, default: 0 },
    likeIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    collects: { type: Number, default: 0 },
    collectIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    pubPlace: String,
});

// lrcSchema.pre('save', function (next) {
//     next();
// });

var Lrc = mongoose.model('Lrc', lrcSchema);

// function Lrc(lrc) {
//     this.title = lrc.title;
//     this.content = lrc.content;
//     this.bg = lrc.bg;
//     this.author = lrc.author;
//     this.publishTime = lrc.publishTime;
//     this.views = 0;
//     this.likes = 0;
//     this.likeIds = [];
//     this.collects = 0;
//     this.comments = [];
// }

// Lrc.prototype.save = function(callback) {
//     var lrc = this;
//     var newLrc = lrcModel(lrc);
//     newLrc.save(function(err, lrc) {
//         if (err) {
//             return callback(err);
//         }
//         callback(null, lrc);
//     });
// };

// Lrc.get = function(id, callback) {
//     try {
//         var id = new ObjectId(id);
//     } catch (err) {
//         return callback(err);
//     }

//     lrcModel.findById(id, function(err, lrc) {
//         if (err) {
//             return callback(err)
//         };
//         return callback(err, lrc);
//     })

//     // async.waterfall([
//     //         function (cb) {
//     //             mongodb.open(function (err, db) {
//     //                 cb(err, db);
//     //             })
//     //         },
//     //         function (db, cb) {
//     //             db.collection('lrc', function (err, collection) {
//     //                 cb(err, collection);
//     //             })
//     //         },
//     //         function (collection, cb) {
//     //             // collection.aggregate([{
//     //             //         $match: { _id: id }
//     //             //     }, {
//     //             //         $lookup: {
//     //             //             from: 'comment',
//     //             //             localField: '_id',
//     //             //             foreignField: 'lrcId',
//     //             //             as: 'comments'
//     //             //         }
//     //             //     }, {
//     //             //         $unwind: '$comments'
//     //             //     }, {
//     //             //         $lookup: {
//     //             //             from: 'user',
//     //             //             localField: 'comments.authorId',
//     //             //             foreignField: '_id',
//     //             //             as: 'authorInfo'
//     //             //         }
//     //             //     }

//     //             // , {
//     //             //                 $lookup: {
//     //             //                     from: 'user',
//     //             //                     localField: 'comments.authorId',
//     //             //                     foreignField: '_id',
//     //             //                     as: 'comments'
//     //             //                 }
//     //             //             }

//     //             // ],
//     //             // 
//     //             // 


//     //             collection.aggregate([{
//     //                 $match: { _id: id }
//     //             }, {
//     //                 $lookup: {
//     //                     from: 'users',
//     //                     localField: '_id',
//     //                     foreignField: 'lrcId',
//     //                     as: 'comments'
//     //                 }
//     //             }, ]);
//     //             // collection.findOne({ _id: id }, function (err, lrc) {
//     //             //     cb(err, lrc, collection)
//     //             // })

//     //             // function (err, lrc) {
//     //             //     console.log('err aggregate', err)
//     //             //     console.log('lrc', lrc)
//     //             //     cb(err, lrc[0], collection);
//     //             // });

//     //             // collection.findOne({ _id: id }, function (err, lrc) {
//     //             //     console.log(err)
//     //             //     cb(err, lrc, collection);
//     //             // })
//     //         },
//     //         function (lrc, collection, cb) {
//     //             lrc.views += 1;
//     //             collection.save(lrc, function (err) {
//     //                 cb(err, lrc);
//     //             });
//     //         }
//     //     ],
//     //     function (err, lrc) {
//     //         mongodb.close();
//     //         return callback(err, lrc);
//     //     });
// }


// Lrc.like = function(id, likeOrUnlike, callback, userId) {
//     try {
//         var id = new ObjectId(id);
//     } catch (err) {
//         return callback(err);
//     }
//     async.waterfall([
//         function(cb) {
//             mongodb.open(function(err, db) {
//                 cb(err, db);
//             })
//         },
//         function(db, cb) {
//             db.collection('lrc', function(err, collection) {
//                 cb(err, collection);
//             })
//         },
//         function(collection, cb) {
//             collection.findOne({ _id: id }, function(err, lrc) {
//                 console.log(err)

//                 cb(err, lrc, collection);
//             })
//         },
//         function(lrc, collection, cb) {
//             console.log('lrc', lrc)
//             if (lrc) {
//                 if (likeOrUnlike == 1) {
//                     lrc.likeIds.push(userId)
//                     console.log('lrc.likeIds', lrc.likeIds)

//                     lrc.likes += 1;
//                 } else if (likeOrUnlike == -1) {
//                     var index = lrc.likeIds.indexOf(userId);
//                     console.log('index', index);
//                     lrc.likeIds.splice(index, 1);
//                     lrc.likes -= 1;
//                 }
//             }
//             collection.save(lrc, function(err) {
//                 cb(err, lrc);
//             });

//         }
//     ], function(err, lrc) {
//         mongodb.close();
//         return callback(err, lrc);
//     });
// };

// Lrc.getAll = function(callback) {
//     async.waterfall([
//         function(cb) {
//             mongodb.open(function(err, db) {
//                 cb(err, db);
//             });
//         },
//         function(db, cb) {
//             db.collection('lrc', function(err, collection) {
//                 cb(err, collection);
//             });
//         },
//         function(collection, cb) {
//             collection.find().toArray(function(err, lrcs) {
//                 cb(err, lrcs);
//             });
//         }
//     ], function(err, lrcs) {
//         mongodb.close();
//         return callback(err, lrcs);
//     });
// };

// Lrc.comment = function(lrcId, content, userId, callback) {
//     lrcModel.findById(lrcId, function(err, lrc) {

//         if (err) {
//             return callback(err);
//         }
//         var comment = new Comment({
//             authorId: userId,
//             content: content,
//             commentTime: new Date(),
//             lrcId: lrcId
//         });

//         comment.save(function(err, comment) {
//             if (err) {
//                 return callback(err);

//             }
//             console.log(comment);
//             // lrc.comments.push(comment._id);
//             console.log('lrc', lrc);
//             lrc.save(function(err, lrc) {
//                 console.log('lrc', lrc)
//                 if (err) {
//                     return callback(err);
//                 }
//                 callback(err, lrc);
//             })
//         });
//     });
// };

// Lrc.deleteComment = function(lrcId, comment, callback) {
//     try {
//         var id = new ObjectId(lrcId);
//     } catch (err) {
//         return callback(err);
//     }
//     async.waterfall([
//         function(cb) {
//             mongodb.open(function(err, db) {
//                 cb(err, db);
//             })
//         },
//         function(db, cb) {
//             db.collection('lrc', function(err, collection) {
//                 cb(err, collection);
//             })
//         },
//         function(collection, cb) {
//             collection.findOne({ _id: id }, function(err, lrc) {
//                 console.log(err)

//                 cb(err, lrc, collection);
//             })
//         },
//         function(lrc, collection, cb) {
//             console.log('lrc', lrc)
//             if (lrc) {
//                 comment = JSON.parse(comment);
//                 comment.commentTime = new Date(comment.commentTime);
//                 console.log('comment', comment)
//                 var index = lrc.comments.indexOf(comment);
//                 console.log('index', index);
//                 if (index > 0) {
//                     lrc.comments.splice(index, 1);
//                 }

//                 collection.save(lrc, function(err) {
//                     cb(err, lrc);
//                 });
//             } else {
//                 cb(null, lrc);
//             }


//         }
//     ], function(err, lrc) {
//         mongodb.close();

//         return callback(err, lrc);
//     });
// }

module.exports = Lrc;
