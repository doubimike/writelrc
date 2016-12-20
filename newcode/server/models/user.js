var mongodb = require('./db');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/lrc');

var async = require('async');
var util = require('../util');
var crypto = require('crypto');


var msgSchema = new Schema({
    title: String,
    type: String,
    time: { type: Date, default: Date.now },
    content: Object,
    readed: { type: Boolean, default: false },
    author: String
});

var userSchema = new mongoose.Schema({
    name: { type: String, require: true, unique: true },
    intro: { type: String },
    password: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    head: String,
    location: String,
    created_at: Date,
    updated_at: Date,
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    collects: [{ type: Schema.Types.ObjectId, ref: 'Lrc' }],
    msgBox: [msgSchema]
});

userSchema.pre('save', function (next) {
    // create or update time
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at) {
        this.created_at = currentDate;
    };
    // var md5 = crypto.createHash('md5');
    // // hash pw
    // this.password = md5.update(this.password).digest('hex');

    // hash head
    var md5 = crypto.createHash('md5');
    var email_MD5 = md5.update(this.email.toLowerCase()).digest('hex');
    this.head = 'http://www.gravatar.com/avatar/' + email_MD5 + '?s=48';
    next();
});


var User = mongoose.model('User', userSchema);

module.exports = User;
