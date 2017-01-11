var fs = require('fs-extra');
var path = require('path');
var execSync = require('child_process').execSync;
var emitter = require('../event');
var util = require('../util');
var ora = util.ora;

var glob = require('glob');

exports.name = 'init';
exports.usage = '<dir_path>';
exports.desc = 'init miniapp directory structure';

exports.run = function initCmd(dirName, projectType) {
  // projectType 
  var cssType = projectType == 'standard' ? 'wxss' : projectType
  var cwdDirPath = process.cwd();
  var distDirPath = path.join(cwdDirPath, dirName);
  var templateDirPath = path.resolve(__dirname, '../../template/project');

  fs.copy(templateDirPath, distDirPath, function(err) {
    if (err) return console.error(err);

    var configFilePath = distDirPath + '/miniapp.config.json';
    var configJSON = require(configFilePath);
    configJSON.projectType = projectType;
    fs.outputJson(configFilePath, configJSON, function(err) {
      if (err) return console.error(err);
    });

    glob(distDirPath + "/src/**/*.__suffix__", function(er, files) {
      for (var i = 0; i < files.length; i++) {
        if (fs.statSync(files[i]).isFile()) {
          var renamedFilePath = files[i].replace('__suffix__', cssType)
          fs.renameSync(files[i], renamedFilePath)
        }
      }

      process.chdir(dirName);

      var installDepend = ora('installing dependencies');
      installDepend.start();
      console.log('');
      util.execSync('npm i --registry=https://registry.npm.taobao.org');

      installDepend.stop();

      console.log('init src success~');

      emitter.emit('init');

    });
  });
}