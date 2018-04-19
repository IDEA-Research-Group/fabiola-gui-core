var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// database
var mongoose = require('mongoose');
var config = require("./config").config;

mongoose.connect(config.application.db.mongoUri);
mongoose.plugin(require('mongoose-ref-validator'));

// routes
var index = require('./routes/index');
var users = require('./routes/users');
var instances = require('./routes/instances');
var modelDefinitions = require('./routes/modelDefinitions');
var results = require('./routes/results');

var BASE_API_PATH = "/api/v1";

// Directory base path
global.__base = __dirname + '/';

var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/release')));

// app.use(BASE_API_PATH+'/', index);
app.use(BASE_API_PATH + '/instances', instances);
app.use(BASE_API_PATH + '/modelDefinitions', modelDefinitions);
app.use(BASE_API_PATH + '/results', results);
//app.use('/users', users);


// send web application version
app.get(BASE_API_PATH + '/getVersion', function(req, res) {
    var fs = require('fs');
    var path = require('path');
    var obj;
    var pathToFile = path.resolve(__base, 'package.json');

    fs.readFile(pathToFile, 'utf8', function(err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        res.send(obj.version);
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    console.log("Error handler middleware");
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    // res.status(err.status || 500);
    // res.render('error');
    console.log(err);
    if(err.name == 'ValidationError')
        res.status(422).send({error: err.message});
    else if (err.name == 'MongoError'){
        if(err.code == 66)
            res.status(400).send({error: 'You are trying to modify an immutable field.'});
        else
            res.status(500).send({error: 'An error occurred in the database.'});
    } else
        res.sendStatus(err.status || 500);
});

module.exports = app;
