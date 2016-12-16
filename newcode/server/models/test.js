var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/lrc');
var Schema = mongoose.Schema;
var userSchema = new Schema({
    phone: {
        type: String,
        validate: {
            validator: function (v) {
                return /d{3}-d{3}-d{4}/.test(v);
            },
            message: '{VALUE} is not a valid phone number!'
        }
    }
});

var User = mongoose.model('user', userSchema);

var u = new User();

// u.phone = '555.0123';
// Prints "ValidationError: 555.0123 is not a valid phone number!"
// console.log(u.validateSync().toString());

u.phone = '201-555-0123';
// Prints undefined - validation succeeded!
console.log(u.validateSync());
