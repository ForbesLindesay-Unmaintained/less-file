'use strict';

var fs = require('fs');
var path = require('path');
var less = require('less');
var Promise = require('promise');
var resolveNpmFile = require('resolve');

var readFile = Promise.denodeify(fs.readFile);
var LessParser = less.Parser;



module.exports = parseFile;

function parseFile(filename, options) {
  options = options || {};
  options.filename = filename;
  options.paths = options.paths || [path.dirname(options.filename)];
  return readFile(filename, 'utf8').then(function (str) {
    return parse(str, options);
  });
}
function parse(str, options) {
  return new Promise(function (resolve, reject) {
    var parser = new LessParser(options);
    var importsPush = parser.imports.push;
    parser.imports.push = function (a, b, importOptions, c) {
      if (importOptions.npm) {
        var fileLoader = LessParser.fileLoader;
        LessParser.fileLoader = function (file, currentFileInfo, callback, env) {
          LessParser.fileLoader = fileLoader;
          var fl = LessParser.fileLoader;
          resolveNpmFile(file, {basedir: currentFileInfo.currentDirectory, extensions: ['.less', '.css']}, function (err, newfile) {
            if (err || !newfile) newfile = file;
            else newfile = path.relative(currentFileInfo.currentDirectory, newfile);
            LessParser.fileLoader(newfile, currentFileInfo, callback, env);
          });
        };
      };
      return importsPush.apply(parser.imports, arguments);
    }
    parser.parse(str, function (err, ast) {
      if (err) return reject(err);
      try {
        resolve({
          parser: parser,
          ast: ast,
          //css: ast.toCSS(options)
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