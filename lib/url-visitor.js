'use strict';

var path = require('path');
var less = require('less');

var LessVisitor = less.tree.visitor;

module.exports = function visitor(getURL, ast) {
  return (new LessVisitor({
    'visitUrl': visitUrl.bind(this, getURL)
  })).visit(ast);
}

function visitUrl(getURL, node) {
  if (node.value && node.value.value
   && typeof node.value.value === 'string'
   && node.value.value.indexOf('@') === -1) {
    var fragment = node.value.value.replace(/^[^#]*/, '');
    var file = path.resolve(node.currentFileInfo.currentDirectory, node.value.value.split('#')[0]);
    node.value.value = getURL(file) + fragment;
  }
}