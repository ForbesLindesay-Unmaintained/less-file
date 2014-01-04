# bootstrap-middleware

Middleware for twitter bootstrap

[![Build Status](https://travis-ci.org/ForbesLindesay/bootstrap-middleware.png?branch=master)](https://travis-ci.org/ForbesLindesay/bootstrap-middleware)
[![Dependency Status](https://gemnasium.com/ForbesLindesay/bootstrap-middleware.png)](https://gemnasium.com/ForbesLindesay/bootstrap-middleware)
[![NPM version](https://badge.fury.io/js/bootstrap-middleware.png)](http://badge.fury.io/js/bootstrap-middleware)

## Installation

    npm install bootstrap-middleware

```js
var options = {
  optimization: 1,
  strictImports: false,
  insecure: false,
  rootpath: '',
  relativeUrls: false,
};

options.paths = [path.dirname(input)].concat(options.paths);
options.filename = input;
// parser.imports.files
// ast.toCSS(options)
{
  silent: options.silent,
  verbose: options.verbose,
  ieCompat: options.ieCompat,
  compress: options.compress,
  cleancss: options.cleancss,
  cleancssOptions: cleancssOptions,
  sourceMap: Boolean(options.sourceMap),
  sourceMapFilename: options.sourceMap,
  sourceMapURL: options.sourceMapURL,
  sourceMapOutputFilename: options.sourceMapOutputFilename,
  sourceMapBasepath: options.sourceMapBasepath,
  sourceMapRootpath: options.sourceMapRootpath || "",
  outputSourceFiles: options.outputSourceFiles,
  writeSourceMap: function (output) {
    fs.writeFile(filename, output);
  },
  maxLineLen: -1,    // default
  strictMath: true,  // not default
  strictUnits: false // default
}
```

## License

  MIT