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
    updateTime: { type: Date },
    views: { type: Number, default: 0 },
    bg: String,
    likes: { type: Number, default: 0 },
    likeIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    collects: { type: Number, default: 0 },
    collectIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    pubPlace: String,
    popularScore: { type: Number },
});

// lrcSchema.index({ title: 'text', content: 'text', bg: 'text', author: 'text' });

lrcSchema.pre('save', function (next) {
    var popularScore = this.views + this.likes * 5 + this.collects * 10;
    this.popularScore = popularScore;
    next();
});

var Lrc = mongoose.model('Lrc', lrcSchema);

module.exports = Lrc;
