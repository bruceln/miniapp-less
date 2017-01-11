var path = require('path');
var fs = require('fs');
var babel = require('babel-core');
var cachePath = '.miniappcache';
var hash = require('hash-sum');
var util = require('./util');
var config = require('./config').getConfig();

module.exports = {
  compile: function(opath) {
    var src = config.src;
    var dist = config.dist;
    var content = util.readFile(path.join(opath.dir, opath.base));
    var filename = opath.base;
    var target = util.getDistPath(opath, '.js', src, dist);

    var cache;
    if (util.isFile(cachePath)) {
      cache = JSON.parse(util.readFile(cachePath));
    } else {
      cache = Object.create(null);
    }
    var cacheKey = hash(filename + content);
    var output = cache[cacheKey];
    if (output) {
      util.writeFile(target, output);
      return;
    }

    var code = babel.transform(content, {
      presets: ["es2015"],
      babelrc: true,
      minified: false,
      comments: false
    }).code;
    util.writeFile(target, code);

    cache[cacheKey] = code;
    util.writeFile(cachePath, JSON.stringify(cache));
  }
}
