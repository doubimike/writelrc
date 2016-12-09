var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var settings = require('./settings');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// 之前的都是依赖

var app = express();

app.use(session({
    secret: settings.cookieSecret,
    key: settings.db,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
    store: new MongoStore({
        url: 'mongodb://' + settings.host + '/' + settings.db
    })
}));
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, '/dist')));
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(__dirname, '../client/.tmp')));
app.use(express.static(path.join(__dirname, '../client/app')));

app.use(extendAPIOutput);
app.use(apiErrorHandler);

app.use('/', routes);
app.use('/users', users);

// 中间件
function extendAPIOutput(req, res, next) {
    res.apiSuccess = function (data) {
        res.json({
            status: 200,
            result: data
        });
    };
    res.apiError = function (err) {
        res.json({
            status: 'Error',
            error_code: err.error_code || 'UNKNOW',
            error_message: err.error_message || err.toString()
        });
    };

    next();
}

function createApiError(code, msg) {
    var err = new Error(msg);
    err.error_code = code;
    err.error_message = msg;
    return err;
}

function apiErrorHandler(err, req, res, next) {
    if (typeof res.apiError === 'function') {
        return res.apiError(err);
    }

    next();
}


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        // res.render('error', {
        //     message: err.message,
        //     error: err
        // });

        res.json({ error: err });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    // res.render('error', {
    //     message: err.message,
    //     error: {}
    // });
    res.json({ error: err });
});


module.exports = app;
