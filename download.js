'use strict';

var zlib = require('zlib');
var tar = require('tar')
var rimraf = require('rimraf').sync;
var request = require('request');

rimraf(__dirname + '/bootstrap');

request('https://github.com/twbs/bootstrap/archive/v3.0.3.tar.gz')
  .pipe(zlib.gunzip())
  .pipe();
