'use strict';

var assert = require('assert');
var vm = require('vm');
var http = require('http');
var hyperquest = require('hyperquest');
var concat = require('concat-stream');
var express = require('express');
var less = require('../');

console.warn('  Each file is downloaded ~5 times in parallel to get some feel for how');
console.warn('  performance scales.');
console.warn();
console.warn('  When comparing gzip and not gzip, don\'t forget to account for increased');
console.warn('  time unzipping on the client.');

var app = express();

app.use('/style', less(__dirname + '/fixtures/style.less', {
  cache: false,
  minify: false,
  gzip: false,
  debug: true
}));
app.use('/opt/style', less(__dirname + '/fixtures/style.less', {
  cache: true,
  minify: true,
  gzip: true,
  debug: false
}));

app.use('/syntax-error', less(__dirname + '/fixtures/syntax-error.less', {
  cache: false,
  minify: false,
  gzip: false,
  debug: true
}));
app.use('/opt/syntax-error', less(__dirname + '/fixtures/syntax-error.less', {
  cache: true,
  minify: true,
  gzip: true,
  debug: false
}));
app.use(function (err, req, res, next) {
  res.send(500, err.stack || err.message || err);
});

var port;
(function () {
  var listeners = [];
  port = function (fn) {
    listeners.push(fn);
  };
  http.createServer(app)
  .listen(0, function () {
    var pt = this.address().port;
    while (listeners.length) {
      listeners.shift()(pt);
    }
    port = function (fn) {
      fn(pt);
    }
  });
}());

function get(path, optimised, cb) {
  port(function (port) {
    var erred = false;
    hyperquest('http://localhost:' + port + (optimised ? '/opt' : '') + path, function (err, res) {
      erred = err || res.statusCode >= 400;
      if (err) return cb(err);
      if (res.statusCode >= 400) {
        var err = new Error('Server responded with status code ' + res.statusCode);
        err.statusCode = res.statusCode;
        return cb(err);
      }
    })
    .pipe(concat(function (res) {
      if (erred) return;
      return cb(null, res.toString());
    }));
  })
}
function getZip(path, optimised, cb) {
  port(function (port) {
    hyperquest('http://localhost:' + port + (optimised ? '/opt' : '') + path, {headers: {'Accept-Encoding':'gzip'}},
      function (err, res) {
        if (err) return cb(err);
        if (res.statusCode >= 400) {
          var err = new Error('Server responded with status code ' + res.statusCode);
          err.statusCode = res.statusCode;
          return cb(err);
        }
        this.pipe(require('zlib').createGunzip())
            .pipe(concat(function (res) {
              return cb(null, res.toString());
            }));
      })
  })
}


function test(optimised, get, it) {
  var oldIt = it;
  it = function (name, fn) {
    return oldIt(name, function (done) {
      this.slow(100);
      fn(function (err) {
        if (err) return done(err);
        if (/syntax error/.test(name)) return done();
        fn(function (err) {
          if (err) return done(err);
          var pending = 5;
          for (var i = 0; i < 5; i++) {
            fn(then);
          };
          var called = false;
          function then(err) {
            if (err && !called) {
              called = true;
              return done(err);
            }
            if (--pending === 0 && !called) return done();
          }
        })
      })
    });
  };
  describe('file', function () {
    it('compiles bundle includng twbs', function (done) {
      get('/style/bundle.css', optimised, function (err, res) {
        if (err) return done(err);
        done();
      });
    });
    it('returns error code 500 if there is a syntax error', function (done) {
      get('/syntax-error/bundle.css', optimised, function (err, res) {
        assert.equal(err.statusCode, 500);
        done();
      });
    });
  });
}

describe('In NODE_ENV=development (default)', function () {
  test(false, get, it);
});

describe('In NODE_ENV=production', function () {
  describe('without gzip', function () {
    test(true, getZip, it);
  });
  describe('with gzip', function () {
    test(true, get, it);
  });
});