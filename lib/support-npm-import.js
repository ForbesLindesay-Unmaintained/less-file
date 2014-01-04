'use strict';

var assert = require('assert');
var path = require('path');
var less = require('less');
var resolveNpmFile = require('resolve');

var LessParser = less.Parser;

module.exports = supportNpmImport;

function supportNpmImport(parser) {
  if (!/npm/.test(parser.parsers.importOption.toString())) {
    console.error('The (npm) option is not supported by this parser');
    return;
  }
  var importsPush = parser.imports.push;
  parser.imports.push = function (a, b, importOptions, c) {
    var fileLoader = LessParser.fileLoader;
    if (importOptions.npm) {
      LessParser.fileLoader = function (file, currentFileInfo, callback, env) {
        LessParser.fileLoader = fileLoader;
        var fl = LessParser.fileLoader;
        resolveNpmFile(file, {basedir: currentFileInfo.currentDirectory, extensions: ['.less', '.css']}, function (err, newfile) {
          if (err || !newfile) newfile = file;
          else newfile = path.relative(currentFileInfo.currentDirectory, newfile);
          LessParser.fileLoader(newfile, currentFileInfo, callback, env);
        });
      };
    }
    var res = importsPush.apply(parser.imports, arguments);
    assert(LessParser.fileLoader === fileLoader);
    return res;
  };
}