var express = require('express');
var router = express.Router();
var log4js = require('log4js');
var logger = log4js.getLogger();
var Quote = require('../models/quote.js');

router.post('/create', function (req, res) {
    Quote.create({
        content: req.body.content,
        author: req.body.author,
        publishDate: new Date
    }, function (err, quote) {
        if (err) {
            return res.status(500).json({
                err: err
            });
        }
        // get and return all the quotes after you create another
        Quote.find(function (err, quotes) {
            if (err)
                res.send(err);
            res.json(quotes);
        });
    });
});

router.get('/all', function (req, res) {
    Quote.find(function (err, quotes) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) { res.send(err); };

        res.json(quotes); // return all quotes in JSON format
    });
});

router.delete('/delete/:quote_id', function (req, res) {
    Quote.remove({
        _id: req.params.quote_id
    }, function (err, todo) {
        if (err)
            res.send(err);

        // get and return all the todos after you create another
        Quote.find(function (err, quotes) {
            if (err)
                res.send(err);
            res.json(quotes);
        });
    });
});

// router.post('/edit', function (req, res, next) {
//     passport.authenticate('local', function (err, user, info) {
//         if (err) {
//             return next(err);
//         }
//         if (!user) {
//             return res.status(401).json({
//                 err: info
//             });
//         }
//         req.logIn(user, function (err) {
//             if (err) {
//                 return res.status(500).json({
//                     err: 'Could not log in user'
//                 });
//             }
//             res.status(200).json({
//                 status: 'Login successful!'
//             });
//         });
//     })(req, res, next);
// });


// router.get('/like', function (req, res) {
//     if (!req.isAuthenticated()) {
//         return res.status(200).json({
//             status: false
//         });
//     }
//     res.status(200).json({
//         status: true
//     });
// });

module.exports = router;
