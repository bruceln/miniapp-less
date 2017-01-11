var fs = require('fs-extra');
var path = require('path');
var config = require('../config');
var emitter = require('../event');
var util = require('../util');
var generate = require('../generate');

exports.name = 'generate';
exports.usage = '<page>';
exports.desc = 'generate page directory by <page>';

exports.run = function generateCmd(pageName) {
  generate(pageName);
}