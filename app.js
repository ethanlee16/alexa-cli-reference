var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var alexa = require('alexa-app');
var alexaApp = new alexa.app('alexa-cli-reference');
var verifier = require('alexa-verifier');

var app = express();
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Verify incoming Alexa requests
app.use(function(req, res, next) {
  if (!req.headers.signaturecertchainurl) {
    return next();
  }
  var { signaturecertchainurl, signature } = req.headers;
  verifier(signaturecertchainurl, signature, req.body, (err) => {
    if (err) return next(err);
    next();
  });
});

alexaApp.launch((req, res) => {
  res.say("Welcome to Alexa!");
});
alexaApp.express(app, "/alexa/");

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
