var mongodb = require('./db');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/lrc');

var async = require('async');
var util = require('../util');
var crypto = require('crypto');

var userSchema = new mongoose.Schema({
    name: String,
    password: String,
    email: String,
    head: String
});

var userModel = mongoose.model('User', userSchema);

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

User.prototype.save = function (callback) {
    var md5 = crypto.createHash('md5');
    var email_MD5 = md5.update(this.email.toLowerCase()).digest('hex');
    var head = 'http://www.gravatar.com/avatar/' + email_MD5 + '?s=48';
    var user = {
        name: this.name,
        password: this.password,
        email: this.email,
        head: head
    };
    var newUser = new userModel(user);
    newUser.save(function (err, user) {
        if (err) {
            return callback(err);
        }
        callback(null, user);
    });
};

User.get = function (name, email, callback) {
    userModel.findOne({ name: name }, function (err, user) {
        if (err) {
            return callback(err);
        }
        userModel.findOne({ email: email }, function (err, userEmail) {
            if (err) {
                return callback(err);
            }
            return callback(err, user, userEmail);
        });
    });
};

User.login = function (email, password, callback) {
    userModel.findOne({ email: email }, function (err, userEmail) {
        if (err) {
            return callback(err);
        }
        if (!userEmail) {
            return callback(util.createApiError(40003, '没有这个用户'));
        }
        if (password != userEmail.password) {
            return callback(util.createApiError(40004, '密码错误'));
        }
        return callback(err, userEmail);
    });

};


module.exports = User;
