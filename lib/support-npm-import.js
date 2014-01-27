'use strict';

var assert = require('assert');
var path = require('path');
var resolveNpmFile = require('resolve').sync;
var less = require('../thirdparty/less');

var LessParser = less.Parser;

var fileLoader = LessParser.fileLoader.bind(LessParser);

module.exports = supportNpmImport;

function supportNpmImport(parser) {
  if (!/npm/.test(parser.parsers.importOption.toString())) {
    console.error('The (npm) option is not supported by this parser');
    return;
  }
  var importsPush = parser.imports.push;
  parser.imports.push = function (a, b, importOptions, c) {
    var called = false;
    LessParser.fileLoader = function (file, currentFileInfo, callback, env) {
      called = true;
      if (importOptions.npm) {
        try {
          var newfile = resolveNpmFile(file.replace(/\.less$/, ''), {
            basedir: currentFileInfo.currentDirectory,
            extensions: ['.less', '.css'],
            packageFilter: packageFilter
          });
          if (newfile) file = newfile;
        } catch (ex) {/* npm file not found */}
      }
      fileLoader(file, currentFileInfo, callback, env);
    };
    var res = importsPush.apply(parser.imports, arguments);
    assert(called);
    return res;
  };
}

function packageFilter(info, pkgdir) {
  // no style field, keep info unchanged
  if (!info.style) {
    return info;
  }

  // replace main
  if (typeof info.style === 'string') {
    info.main = info.style;
    return info;
  }

  return info;
}
