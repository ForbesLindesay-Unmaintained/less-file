'use strict';

var path = require('path');
var express = require('express');
var compile = require('./lib/compiler');
var settings = require('./lib/settings.js');

module.exports = less;
module.exports.settings = settings;
function less(filename, options) {
  options = settings.normalize(options || {});

  var app = express();

  app.get('/bundle.css', function (req, res, next) {
    compile(filename, options).done(function (result) {
      res.setHeader('content-type', 'text/css');

      // vary
      if (!res.getHeader('Vary')) {
        res.setHeader('Vary', 'Accept-Encoding');
      } else if (!~res.getHeader('Vary').indexOf('Accept-Encoding')) {
        res.setHeader('Vary', res.getHeader('Vary') + ', Accept-Encoding');
      }

      //check old etag
      if (req.headers['if-none-match'] === result.md5) {
        res.statusCode = 304;
        res.end();
        return;
      }
      
      //add new etag
      res.setHeader('ETag', result.md5);

      //add cache control
      if (options.cache && options.cache !== 'dynamic') {
        res.setHeader('Cache-Control', options.cache);
      }

      var buffer = result.raw;
      //add gzip
      if (options.gzip && supportsGzip(req)) {
        res.setHeader('Content-Encoding', 'gzip');
        buffer = result.gzipped;
      }

      //set content-length (buffer must always be a buffer)
      res.setHeader('Content-Length', buffer.length);

      if ('HEAD' === req.method) res.end();
      else res.end(buffer);
    }, next);
  });

  app.get('/files/:fileID/:filename', function (req, res, next) {
    var filename;
    if (filename = compile.file(req.params.fileID)) {
      res.setHeader('X-Server-File-Name', filename);
      res.sendfile(filename);
    } else {
      next();
    }
  });

  return app;
}

function supportsGzip(req) {
  return req.headers
      && req.headers['accept-encoding']
      && req.headers['accept-encoding'].indexOf('gzip') !== -1;
}