'use strict';

var path = require('path');
var express = require('express');
var parse = require('./lib/parser');

module.exports = less;
function less(filename, options) {
  var app = express();
  
  

  var id = 0;
  var files = [];
  app.get('/bundle.css', function (req, res, next) {
    parse(filename, {
      //strictMath: true,
      relativeUrls: false,
      sourceMap: true,
      outputSourceFiles: true,
      getURL: function (filename) {
        var file = filename.replace(/\\/g, '/').split('/').pop();
        var fileID = files.indexOf(filename);
        if (fileID === -1) {
          fileID = files.length;
          files.push(filename);
        }
        return 'files/' + fileID + '/' + file;
      }
    }).done(function (result) {
      console.dir(result.files);
      res.type('css');
      res.send(result.css);
    }, next);
  });
  app.get('/files/:fileID/:filename', function (req, res, next) {
    if (files[req.params.fileID]) {
      var filename = files[req.params.fileID];
      res.setHeader('X-Server-File-Name', filename);
      res.sendfile(filename);
    } else {
      next();
    }
  });
  app.use(function (req, res, next) {
    console.log('404: ' + req.path);
    next();
  });
  
  return app;
}