var mongodb = require('./db');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/lrc');

var async = require('async');
var util = require('../util');
var crypto = require('crypto');

var userSchema = new mongoose.Schema({
    name: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    head: String,
    location: String,
    created_at: Date,
    updated_at: Date,
    // lrcs: [{ type: Schema.Types.ObjectId, ref: 'Lrc' }],
});

userSchema.pre('save', function (next) {
    // create or update time
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at) {
        this.created_at = currentDate;
    };
    var md5 = crypto.createHash('md5');
    // hash pw
    this.password = md5.update(this.password).digest('hex');

    // hash head
    var md5 = crypto.createHash('md5');
    var email_MD5 = md5.update(this.email.toLowerCase()).digest('hex');
    this.head = 'http://www.gravatar.com/avatar/' + email_MD5 + '?s=48';
    next();
});


var User = mongoose.model('User', userSchema);

module.exports = User;
