var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var alexa = require('alexa-app');
var alexaApp = new alexa.app('alexa-cli-reference');
var verifier = require('alexa-verifier');
var speech = require('./speech-assets');
var handlers = require('./speech-handlers');
var fs = require('fs');

var app = express();
app.set('view engine', 'pug');
var IS_DEV = app.get('env') === 'development';

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Verify incoming Alexa requests
app.use((req, res, next) => {
  if (!req.headers.signaturecertchainurl) {
    return next();
  }
  var { signaturecertchainurl: cert, signature } = req.headers;
  verifier(cert, signature, JSON.stringify(req.body), (err) => {
    if (err) return next(err);
    console.log("Verified Alexa request!");
    next();
  });
});

alexaApp.launch((req, res) => {
  res.say("Welcome to Alexa!");
});

for (var intent in speech) {
  console.log("Registering " + intent + " intent");
  alexaApp.intent(intent, speech[intent], handlers[intent]);
}

alexaApp.express(app, "/alexa/");

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (IS_DEV) {
  fs.writeFile(
    path.join(__dirname, 'speech-definitions/intent-schema.js'), 
    alexaApp.schema(), (err) => {
      if (err) return console.error("Failed to write schema.", err);
      console.log("Schema written to speech-definitions/intent-schema.js.");
  });

  fs.writeFile(
    path.join(__dirname, 'speech-definitions/utterances.txt'),
    alexaApp.utterances(), (err) => {
      if (err) return console.error("Failed to write utterances.", err);
      console.log("Utterances written to speech-definitions/utterances.txt");
    }
  )

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
