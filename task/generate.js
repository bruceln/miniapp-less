var fs = require('fs-extra');
var path = require('path');
var config = require('./config');
var emitter = require('./event');
var util = require('./util');
var ora = util.ora;

module.exports = function generate(pageName, templateDirPath) {
  var genSpinner = ora('generating');
  genSpinner.start();
  var cwdDirPath = process.cwd();
  var pagesDirName = config.getConfig('pages');
  var srcDir = config.getConfig('src');
  var distAppjsonPath = path.join(cwdDirPath, srcDir, 'app.json');
  var distPagesDirPath = path.join(cwdDirPath, srcDir, pagesDirName, pageName);
  templateDirPath = templateDirPath || path.resolve(__dirname, '../template/page');
  var allowedFileNames = [
    'index.js',
    'index.json',
    'index.html',
    'index.__suffix__'
  ];
  var filesLen = allowedFileNames.length;

  if (fs.existsSync(distPagesDirPath)) {
    console.warn('The path was already existed: ' + distPagesDirPath);
    return
  } else {
    fs.ensureDirSync(distPagesDirPath);
  }

  allowedFileNames.forEach(function (fileName, index) {
    var projectType = util.getProjConfig().projectType;
    var cssType = projectType == 'standard' ? 'wxss' : projectType
    var suffix = path.extname(fileName);

    suffix = suffix.replace('__suffix__', cssType);

    var templateFilePath = path.join(templateDirPath, fileName);
    var distFilePath = path.join(distPagesDirPath, pageName + suffix);

    fs.copy(templateFilePath, distFilePath, function (err) {
      if (err) return console.error(err);
      filesLen--;

      if (!filesLen) {
        success();
      }
    })
  })

  function success() {
    fs.readJson(distAppjsonPath, function (err, jsonObj) {
      if (err) return console.error(err);

      // register page path to app.json
      jsonObj.pages.push(
        [
          pagesDirName,
          pageName,
          pageName
        ].join('/')
      );

      // write modified json to app.json
      fs.outputJson(distAppjsonPath, jsonObj, function (err) {
        if (err) return console.error(err);
        genSpinner.stop();
        console.log(
          [
            'generate page directory success:',
            distPagesDirPath
          ].join(' ')
        );

        emitter.emit('generated')
      });
    });
  }
}