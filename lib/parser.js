'use strict';

var fs = require('fs');
var path = require('path');
var less = require('less');
var Promise = require('promise');
var urlVisitor = require('./url-visitor.js');
var supportNpmImport = require('./support-npm-import.js');

var readFile = Promise.denodeify(fs.readFile);
var LessParser = less.Parser;

module.exports = parseFile;

function parseFile(filename, options) {
  options = options || {};
  options.filename = path.resolve(filename);
  options.paths = options.paths || [path.dirname(options.filename)];
  return readFile(filename, 'utf8').then(function (str) {
    return parse(str, options);
  });
}

function parse(str, options) {
  var filename = options.filename;
  return new Promise(function (resolve, reject) {
    var parser = new LessParser(options);
    supportNpmImport(parser);
    parser.parse(str, function (err, ast) {
      if (err) return reject(err);
      try {
        urlVisitor(options.getURL, ast);
        resolve({
          parser: parser,
          ast: ast,
          files: Object.keys(parser.imports.files).concat([filename]),
          css: ast.toCSS(options)
        });
      } catch (ex) {
        reject(ex);
      }
    })
  }).then(null, function (err) {
    if (err.constructor.name === 'LessError' && typeof err === 'object') {
      err.filename = err.filename || '"Unkown Source"';
      var ex = new Error(less.formatError(err, options)
                         .replace(/^[^:]+:/, ''), err.filename, err.line);
      ex.name = err.type;
      throw ex;
    }
    throw err;
  });
}
