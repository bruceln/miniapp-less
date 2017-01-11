'use strict';
require('./option');
var fs = require('fs-extra');
var path = require('path');
var task = require('./task');
var emitter = require('./task/event');
var pkg = require('./package.json');
var version = pkg.version;

var prompt = require('./task/prompt');

var miniapp = module.exports = {};

var prompts = [{
    type: 'list',
    name: 'projectType',
    message: '请选择需要创建的项目类型? ',
    choices: [{
        name: '官方标准项目结构. ',
        value: 'standard'
    }, {
        name: '基于 sass 的项目结构 ',
        value: 'sass'
    }, {
        name: '基于 less 的项目结构 ',
        value: 'less'
    },
    {
        name: '基于 stylus 的项目结构 ',
        value: 'styl'
    }]
}];

miniapp.cli = {};

miniapp.cli.name = 'miniapp';

//colors
miniapp.cli.colors = require('colors');

miniapp.cli.helpInfo = function() {

    var content = [];

    var taskPath = __dirname + '/task/cmd';
    fs.readdirSync(taskPath).forEach(function(filename) {
        var filepath = path.join(taskPath, filename);

        var cmdInfo = require(filepath);

        if (cmdInfo && cmdInfo.name) {

            var name = require(filepath).name;
            // name = miniapp.util.pad(name, 16);

            var desc = require(filepath).desc;

            var usage = require(filepath).usage

            content.push('    ' + name.green + ' ' + usage.green + '    ' + (desc || '').grey);
            content.push('');
        }


    });

    return content.join('\n');
}

miniapp.cli.help = function() {

    var helpInfo = miniapp.cli.helpInfo();

    var content = [
        '',
        '  Usage: ' + miniapp.cli.name.cyan + ' <command>'.green,
        '',
        '',
        '  Commands:',
        '',
        '' + helpInfo,
        '  Options:',
        '',
        '    -h, --help          output usage information'.grey,
        '',
        '    -v, --version       output the version number'.grey,
        '',
        '    -w, --watch         watch files to change'.grey,
        ''
    ];

    console.log(content.join('\n'));
};

miniapp.cli.run = function(arg) {
    var verOtions = ['-v', '--version']

    if (verOtions.indexOf(arg[2]) > -1) {
        return console.info(version)
    }

    if (arg.length < 3 || arg[2] === '-h' || arg[2] === '--help') {
        miniapp.cli.help();
        return;
    }

    if (arg.length >= 3) {
        var subCmd = arg[2]
        var subOption = arg[3]
        if (task.hasOwnProperty(subCmd)) {
            if (subCmd == 'init') {
                //init first
                prompt(prompts, function(props) {
                    task[subCmd]['run'](subOption, props.projectType)
                });
            } else {
                task[subCmd]['run'](subOption, 'lass')
            }
        } else {
            miniapp.cli.help()
        }
    }
}

emitter.on('generated', executeBuild);

emitter.on('init', executeBuild);

emitter.on('install', executeBuild);

function executeBuild () {
  task.build.run();
}