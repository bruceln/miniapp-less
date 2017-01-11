require('shelljs/global');
var util = require('../util');
var ora = util.ora;
var path = require('path');
var config = require('../config');
var emitter = require('../event');

exports.name = 'install';
exports.usage = '<component>';
exports.desc = 'download component from gitlab by <component>';

exports.run = function installCmd(componentName) {
  var tmpDir = '.tmp';
  var cwd = util.getCwd();
  mkdir('-p', tmpDir);
  var repoName = ['minapp-widget-', componentName].join('');
  var gitRepo = [
    'https://github.com/miniapps-team/',
    repoName,
    '.git'
  ].join('');
  var cloneTemplate = [
    'git clone',
    gitRepo
  ].join(' ');
  var pagesDirName = config.getConfig('pages');
  var srcDir = config.getConfig('src');
  var templatePath = path.resolve(tmpDir, repoName);
  var distPagesDirPath = path.join(cwd, srcDir, pagesDirName);
  var spinner = ora('downloading component template');
  spinner.start();
  
  if (!which('git')) {
    throw new Error('You should install git first');
    exit(1);
  }

  process.on('exit', function () {
    rm('-rf', tmpDir);
  });
  cd(tmpDir);
  console.log('');
  exec(cloneTemplate);
  cd(cwd);
  spinner.stop();
  util.copySync(templatePath, distPagesDirPath);
  console.log('component ' + componentName + ' has been installed!');
  emitter.emit('install');
}