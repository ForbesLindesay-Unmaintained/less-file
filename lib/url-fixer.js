'use strict';

var path = require('path');
var less = require('../thirdparty/less');

module.exports = fixUrls;
function fixUrls(getURL) {
  less.tree.URL.prototype.genCSS = function (env, output) {
    output.add("url(");

    var basedir = this.currentFileInfo.currentDirectory;
    var add = output.add;
    var buf = [];
    output.add = function (chunk) {
      buf.push(chunk);
    };
    this.value.genCSS(env, output);
    output.add = add;
    if (buf.length === 3 && buf[0] === buf[2] && (buf[0] === '\'' || buf[0] === '"')
        && buf[1].substr(0, 2) !== '//'
        && buf[1].substr(0, 5) !== 'http:'
        && buf[1].substr(0, 6) !== 'https:') {
      var fragment = buf[1].replace(/^[^\#\?]*/, '');
      buf[1] = getURL(path.resolve(basedir, buf[1].split('#')[0].split('?')[0])) + fragment;
    }
    for (var i = 0; i < buf.length; i++) {
      output.add(buf[i]);
    }

    output.add(")");
  }
}
