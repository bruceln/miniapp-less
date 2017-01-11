var util = require('./util');
var path = require('path');
var _defaultConfig = {
  src: 'src',
  dist: 'dist',
  watch: false,
  pages: 'pages'
}

module.exports = {
  getConfig: function (field) {
    if (field) {
      return _defaultConfig[field];
    }
    return _defaultConfig;
  },
  setConfig: function (field, val) {
    _defaultConfig[field] = val;
  },
  processOptions: function (options) {
    options = options || {};
    var projConfig = util.getProjConfig() || {};
    Object.assign(_defaultConfig, projConfig, options);
  }
}