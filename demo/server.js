'use strict';

var express = require('express');
var less = require('../');

var app = express();

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// /style/bundle.css => CSS
app.use('/style', less(__dirname + '/style.less'));

app.listen(3000);