'use strict';

var zlib = require('zlib');
var crypto = require('crypto');
var less = require('less');
var LessParser = less.Parser;

var cache = {};
var zipCache = {};
var tagCache = {};

function md5(str) {
  return crypto.createHash('md5').update(str).digest("hex");
}

//
function compile(filename, options, cb) {
  if (options.paths) [path.dirname(filename)].concat(options.paths);
  else options.paths = [path.dirname(filename)];
  options.filename = filename;

  var parser = new LessParser(options);
  parser.parse(str, function (err, tree) {
    try {
      if (err) throw err;
      var res = tree.toCSS(options);
      cb(null, res);
    } catch (ex) {
      if (ex.constructor.name === 'LessError' && typeof ex === 'object') {
        ex.filename = ex.filename || '"Unkown Source"';
        var err = new Error(less.formatError(ex, options).replace(/^[^:]+:/, ''), ex.filename, ex.line);
        err.name = ex.type;
        ex = err;
      }
      return cb(ex);
    }
  });
}

function gzippedCompile(path, options, cb) {
  compile(path, options, function (err, src) {
    if (err) return cb(err);
    if (options.gzip) {
      zlib.gzip(src, function (err, res) {
        if (err) return cb(err);
        cb(null, new Buffer(src), res, md5(src));
      });
    } else {
      cb(null, new Buffer(src), null, md5(src));
    }
  });
}

function cachedCompile(path, options, cb) {
  if (!options.cache) return gzippedCompile(path, options, cb);
  var cacheKey = JSON.stringify(path);
  if (cache[cacheKey]) {
    return cb(null, cache[cacheKey], zipCache[cacheKey], tagCache[cacheKey]);
  } else {
    gzippedCompile(path, options, function (err, src, gzipped, tag) {
      if (err) return cb(err);//don't cache errors
      cache[cacheKey] = src;
      zipCache[cacheKey] = gzipped;
      tagCache[cacheKey] = tag;
      return cb(null, src, gzipped, tag);
    });
  }
}
module.exports = cachedCompile
