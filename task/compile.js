var path = require('path');
var util = require('./util');
var cStyle = require('./compile-style');
var cScript = require('./compile-script')
var fs = require('fs-extra');
var gaze = require('gaze');
var config = require('./config').getConfig();
var ora = util.ora;
var onOff =true;

module.exports = {
    build: function(file) {
        var self = this;
        var src = config.src;
        var dist = config.dist;
        var watch = config.watch;
        var current = util.getCwd();
        var files = file ? [file] : util.getFiles(src);
        var filesLen = files.length;

        if (!file) {
            fs.removeSync(dist)
        }

        var buildSpinner = ora('building');
        buildSpinner.start();

        files.forEach(function traverseFile(f) {
            if (!util.isAbsPath(f)) {
                f = path.join(current, src, f);
            }
            var opath = path.parse(f);

            self.compile(opath);

            filesLen--;

            if (!filesLen) {
                buildSpinner.stop();
            }
        });

        if (watch&&onOff) {
            self.watch();
        }
    },
    compile: function(opath) {
        var src = config.src;
        var dist = config.dist;

        if (!util.isFile(opath)) {
            console.error('文件不存在：' + util.getRelative(opath));
            return;
        }

        switch (opath.ext) {
            case '.sass':
            case '.scss':
                cStyle.compile('sass', opath);
                break;
            case '.styl':
                cStyle.compile('stylus', opath);
                break;
             case '.less':
                cStyle.compile('less', opath);
                break;
            case '.js':
                cScript.compile(opath);
                break;
            case '.html':
                var distDirPath = util.getDistPath(opath, '', src, dist).replace('.html','.wxml');
                var srcDirPath = path.join(opath.dir, opath.base);
                fs.copy(srcDirPath, distDirPath, function(err) {
                    if (err) return console.error(err)
                })
                break
            default:
                var distDirPath = util.getDistPath(opath, '', src, dist);
                var srcDirPath = path.join(opath.dir, opath.base);

                fs.copy(srcDirPath, distDirPath, function(err) {
                    if (err) return console.error(err)
                })
                break
        }
    },
    watch: function() {
        var self = this;
        var src = config.src;

        console.log('watching files to compile...');

        gaze([src + '/**/*'], function() {
            this.on('all', function(event, filepath) {
                console.log(filepath + ' was ' + event);
                onOff = false;
                self.build(filepath);
            });
        });
    }
}
