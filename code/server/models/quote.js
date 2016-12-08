// quote model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Quote = new Schema({
    content: { type: String, required: true },
    author: { type: String },
    publishDate: Date,
    editDate: Date,
});

module.exports = mongoose.model('Quote', Quote);
