var fs = require('fs-extra');
var path = require('path');
var mkdirp = require('mkdirp');
var execSync = require('child_process').execSync;
var ora = require('ora');

module.exports = {
    ora: ora,
    copySync: fs.copySync,
    removeSync: function (filesToRemove) {
        fs.removeSync(filesToRemove);
    },
    execSync: function (cmd, options) {
        options = options || {};
        options.stdio = options.stdio || [0,1,2];
        var cmdRes = execSync(cmd, options);
        return cmdRes;
    },
    getRelative: function (opath) {
        return path.relative(this.getCwd(), path.join(opath.dir, opath.base));
    },
    isAbsPath: function (p) {
        return path.isAbsolute(p);
    },
    isDir: function (p) {
        if (!fs.existsSync(p)) {
            return false;
        }
        return fs.statSync(p).isDirectory();
    },
    isString: function (obj) {
        return toString.call(obj) === '[object String]';
    },
    getCwd: function () {
        return process.cwd();
    },
    getCliDir: function () {
        return __dirname;
    },
    writeFile: function (p, data) {
        var opath = (this.isString(p) ? path.parse(p) : p);
        if (!this.isDir(opath.dir)) {
            mkdirp.sync(opath.dir);
        }
        fs.writeFileSync(p, data);
    },
    getDistPath: function (opath, ext, src, dist) {
        var dir = '';
        ext = ext ? ext : opath.ext;
        dir = (opath.dir + path.sep).replace(path.sep + src + path.sep, path.sep + dist + path.sep);
        return dir + opath.name + ext;
    },
    isFile: function (p) {
        p = (typeof(p) === 'object') ? path.join(p.dir, p.base) : p;
        if (!fs.existsSync(p)) {
            return false;
        }
        return fs.statSync(p).isFile();
    },
    getFiles: function (dir, prefix) {
        dir = dir || process.cwd();
        prefix = prefix || '';
        dir = path.normalize(dir);
        var self = this;
        if (!fs.existsSync(dir)) {
            return [];
        }
        var files = fs.readdirSync(dir);
        var rst = [];
        files.forEach(function (item) {
            var filepath = dir + path.sep + item;
            var stat = fs.statSync(filepath);
            if (stat.isFile()) {
                rst.push(prefix + item);
            } else if(stat.isDirectory()){
                rst = rst.concat(self.getFiles(path.normalize(dir + path.sep + item),  path.normalize(prefix + item + path.sep)));
            }
        });

        return rst;
    },
    readFile: function (p) {
        var rst = '';
        p = (typeof(p) === 'object') ? path.join(p.dir, p.base) : p;
        try {
            rst = fs.readFileSync(p, 'utf-8');
        } catch (e) {
            rst = null;
        }
        return rst;
    },
    getProjConfig: function () {
        var config;
        var configFile = path.join(this.getCwd(), path.sep, 'miniapp.config.json');
        if (!this.isFile(configFile)) {
            return null;
        } else {
            config = require(configFile);
        }
        return config;
    }
}