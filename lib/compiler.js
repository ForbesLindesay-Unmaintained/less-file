'use strict';

'use strict';

var path = require('path');
var zlib = require('zlib');
var crypto = require('crypto');
var Promise = require('promise');
var parse = require('./parser');

var cache = {};
var files = [];
module.exports = lessCached;
/**
 * options:
 *  - getUrl(string) => string
 */
function lessCached(filename, options) {
  if (options.cache === 'dynamic') {
    throw new Error('Dynamic cache still needs implimenting');
    if (cache[filename]) {
      return cache[filename].then(function (result) {
        
      });
    } else {
      return cache[filename] = lessInternal(filename, options);
    }
  } else if (options.cache) {
    if (cache[filename]) return cache[filename];
    else return cache[filename] = lessInternal(filename, options);
  } else {
    return lessInternal(filename, options);
  }
}


module.exports.file = function (id) {
  return files[id];
};
function lessInternal(filename, options) {
  return parse(filename, {
    //strictMath: true,
    relativeUrls: false,
    sourceMap: !options.minify && options.debug,
    outputSourceFiles: !options.minify && options.debug,
    compress: options.minify,
    getURL: function (filename) {
      if (options.getUrl) {
        var url = options.getUrl(filename);
        return url;
      }
      var file = filename.replace(/\\/g, '/').split('/').pop();
      var fileID = files.indexOf(filename);
      if (fileID === -1) {
        fileID = files.length;
        files.push(filename);
      }
      return 'files/' + fileID + '/' + file;
    }
  }).then(function (result) {
    var css = result.css;
    result = {
      files: result.files,
      md5: md5(css),
      raw: new Buffer(css),
      gzipped: null
    };
    if (options.gzip) {
      return gzip(result.raw).then(function (gzipped) {
        result.gzipped = gzipped;
        return result;
      });
    } else {
      return result;
    }
  });
}

function md5(str) {
  return crypto.createHash('md5').update(str).digest("hex");
}
function gzip(str) {
  return new Promise(function (resolve, reject) {
    zlib.gzip(str, function (err, res) {
      if (err) return reject(err);
      else return resolve(res);
    });
  });
}