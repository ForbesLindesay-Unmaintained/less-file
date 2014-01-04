'use strict';

var path = require('path');
var express = require('express');
var parse = require('./lib/parser');

module.exports = less;
function less(filename) {
  var app = express();
  
  var folderIDs = 0;
  var folders = {};
  var foldersCollection = [];

  function visitUrl(node) {
    console.dir(node);
    if (node.value && node.value.value
     && typeof node.value.value === 'string'
     && node.value.value.indexOf('@') === -1) {
      var folder = node.value.value.split('/');
      var file = folder.pop();
      folder = folder.join('/');
      folder = path.resolve(node.currentFileInfo.currentDirectory, folder);
      var folderID;
      if (!folders[folder]) {
        folderID = folderIDs++;
        folders[folder] = [];
        folders[folder].id = folderID;
        folders[folder].path = folder;
        foldersCollection.push(folders[folder]);
      } else {
        folderID = folders[folder].id;
      }
      if (folders[folder].indexOf(file) === -1) {
        folders[folder].push(file.replace(/#.*$/, ''));
      }
      node.value.value = 'files/' + folderID + '/' + file;
    }
  }

  var fixup = {
    'visitUrl': visitUrl
  };
  
  app.get('/bundle.css', function (req, res, next) {
    parse(filename, {
      //strictMath: true,
      relativeUrls: false,
      sourceMap: true,
      outputSourceFiles: true,
      sourceMapBasepath: __dirname,
      sourceMapRootpath: app.route
    }).done(function (result) {
      var visitor= new (require('less').tree.visitor)(fixup);
      visitor.visit(result.ast);
      res.end(result.ast.toCSS());
    }, next);
  });
  app.get('/files/:folderID/:filename', function (req, res, next) {
    if (foldersCollection[req.params.folderID]
    &&  foldersCollection[req.params.folderID].indexOf(req.params.filename) !== -1) {
      var filename = path.join(foldersCollection[req.params.folderID].path,
                               req.params.filename);
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