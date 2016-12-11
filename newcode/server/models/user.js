var mongodb = require('./db');
var async = require('async');
var util = require('../util');
var crypto = require('crypto');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = User;

User.prototype.save = function(callback) {
    var md5 = crypto.createHash('md5');
    var email_MD5 = md5.update(this.email.toLowerCase()).digest('hex');
    var head = 'http://www.gravatar.com/avatar/' + email_MD5 + '?s=48';
    var user = {
        name: this.name,
        password: this.password,
        email: this.email,
        head: head
    };


    async.waterfall([
            function(cb) {
                mongodb.open(function(err, db) {
                    cb(err, db);
                });
            },
            function(db, cb) {
                db.collection('users', function(err, collection) {
                    cb(err, collection);
                });
            },
            function(collection, cb) {
                collection.insert(user, { safe: true }, function(err, user) {
                    cb(err, user);
                });
            }
        ],
        function(err, user) {
            mongodb.close();
            callback(err, user);
        }
    );
};

User.get = function(name, email, callback) {
    async.waterfall([
        function(cb) {
            mongodb.open(function(err, db) {
                cb(err, db);
            });
        },
        function(db, cb) {
            db.collection('users', function(err, collection) {
                cb(err, collection);
            });
        },
        function(collection, cb) {
            collection.findOne({ name: name }, function(err, user) {
                cb(err, user, collection);
            });
        },
        function(user, collection, cb) {
            collection.findOne({ email: email }, function(err, userEmail) {
                cb(err, user, userEmail);
            });
        }
    ], function(err, user, userEmail) {
        mongodb.close();
        callback(err, user, userEmail);
    });
};

User.login = function(email, password, callback) {
    async.waterfall([
        function(cb) {
            mongodb.open(function(err, db) {
                cb(err, db);
            });
        },
        function(db, cb) {
            db.collection('users', function(err, collection) {
                cb(err, collection);
            });
        },
        function(collection, cb) {
            collection.findOne({ email: email }, function(err, user) {
                cb(err, user);
            });
        },
        function(user, cb) {
            if (!user) {
                cb(util.createApiError(40003, '没有这个用户'));
            } else
            if (password != user.password) {
                cb(util.createApiError(40004, '密码错误'));
            } else {
                cb(null, user);
            }
        }
    ], function(err, user) {
        mongodb.close();
        callback(err, user);
    });
};
