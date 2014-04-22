# less-file

**Middleware for less & express with bonus npm support, sane & simple handling of static assets and sensible defaults for the ultimate in ease of use.**

In addition to the basics, less-file also comews witht he following features out of the box:

 - less extended with `@import (npm) "package-name"` syntax
 - static assets like fonts and images automatically taken care of
 - source-maps are automatically enabled for debugging
 - minification automatically enabled in production
 - gzip automatically enabled in production
 - etags for caching automatically supported

If you think I've missed something, be sure to open an issue or submit a pull request.

If you find it useful, please support me on [gittip](https://www.gittip.com/ForbesLindesay/)

[![Build Status](https://img.shields.io/travis/ForbesLindesay/less-file/master.svg)](https://travis-ci.org/ForbesLindesay/less-file)
[![Dependency Status](https://img.shields.io/gemnasium/ForbesLindesay/less-file.svg)](https://gemnasium.com/ForbesLindesay/less-file)
[![NPM version](https://img.shields.io/npm/v/less-file.svg)](http://badge.fury.io/js/less-file)

## Usage

If you have installed `twbs` via `npm install twbs --save` you can use the following less file:

```less
@import (npm) "twbs";

//any custom less stuff here
```

Along with the server:

```js
var less = require('less-file');
var express = require('express');
var app = express();

// serve CSS for '/style/index.less' at '/style/bundle.css'
app.use('/style', less(__dirname + '/style/index.less'));

app.listen(3000);
```

Then when you fetch `http://localhost:3000/style/bundle.css` you will get a CSS bundle, but any `url("./file.png")` style references in the less files will be properly resolved as relative addresses, givena  unique ID and then served up from `/style` so you don't need to manually mess with anything to get twitter bootstrap's glyphicon fonts to just work.

## Compatible npm modules

This location will list npm modules that are known to be fully compatible with `less-file`:

 - `twbs` - a tiny modificaion of Twitter's Bootstrap to support both browserify and less-file properly.

If you want to make your own module compatible with less-file, you can just leave an `index.less` or `index.css` file in the root of a package and then publish it to npm.  Alternatively you can set the `"style"` field in your package.json file to override that path.

## API

### less('filename', options) => express middleware app

Less-file takes a filename and some options and returns an express web server.  It serves up the css file at `/bundle.css` so if you do:

```js
app.use('/style', less(__dirname + '/style/index.less'));
```

you can request the file from `/style/bundle.css`

### Options

The `options` passed to each middleware function override the defaults specified in `settings`.

Setings has two properties `settings.production` and `settings.development` which specify the default settings for each environment.  The current environment is specified by `settings.mode` and defaults to `process.env.NODE_ENV || 'development'`

Production defaults:

```javascript
production.cache = true; // equivalent to "public, max-age=60"
production.minify = true;
production.gzip = true;
production.debug = false;
```

To update:

```javascript
less.settings.production('cache', '7 days');
```

Development defaults:

```javascript
development.cache = false;
development.minify = false;
development.gzip = false;
development.debug = true;
```

To update:

```javascript
less.settings.development('gzip', true);
```

#### cache

The cache setting determines how long content can be cached in the client's web browsers (and any caching proxies) and whether or not to cache bundles server side. Any value other than false will result in them being cached server side.

 - If cache is `true` the client will recieve Cache Control of `"public, max-age=60"`, which caches for 60 seconds.
 - If cache is a string in the form accepted by [ms](https://npmjs.org/package/ms) it becomes: `"public, max-age=" + (ms(cache)/1000)`
 - If cache is a number, it is treated as being in milliseconds so becomes: `"public, max-age=" + (cache/1000)`
 - If cache is an object of the form `{private: true || false, maxAge: '10 minutes'}` it becomes the apropriate string.
 - If cache is any other string it will be sent directly to the client.

N.B. that if caching is enabled, the server never times out its cache, no matter what the timeout set for the client.

#### minify

If minify is true, less will be told to compress its output.  This automatically disables `debug`.

#### gzip

If `gzip` is `true`, GZip will be enabled when clients support it.  This increases the memory required for caching by aproximately 50% but the speed boost can be considerable.  It is `true` by default in production.

#### debug

If `debug` is `true`, a source map will be added to the code.  This is very useful when debugging.  `debug` is `false` by default in produciton.

## License

  MIT