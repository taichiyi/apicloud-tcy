#!/usr/bin/env node

const commander = require('commander');
const path = require('path');
const fs = require('fs');

const tcy = require('./core/tcy.js');

var cwd = process.cwd();
var projectRootPath = cwd; //project root path

/**
 * get version
 * @return {String} []
 */
var getVersion = function getVersion() {
    var filepath = path.resolve(__dirname, '../package.json');
    var version = JSON.parse(fs.readFileSync(filepath)).version;
    return version;
};

/**
 * display tcy version
 * @return {} []
 */
var displayVersion = function displayVersion() {
    var version = getVersion();
    var chars = [' _______   _____   __      __', '|__   __| | ____|  \\ \\    / /', '   | |    | |       \\ \\  / / ', '   | |    | |        \\_\\/ /  ', '   | |    | |___     __/ /   ', '   |_|    |_____|   |___/    ', '                             '].join('\n');
    console.log('\n v' + version + '\n');
    console.log(chars);
};

commander.option('-v, --version', 'output the version number', function() {
    displayVersion();
});

//create project
commander
    .command('new <projectPath>')
    .description('create project')
    .action(function(projectPath) {
        projectRootPath = path.resolve(projectRootPath, projectPath);
        tcy.createProject(projectRootPath);
    });

//create window
commander
    .command('window <windowName> <windowTitle>')
    .description('create window')
    .action(function(windowName, windowTitle) {
        tcy.add_win(windowName, windowTitle);
    });

//create frame
commander
    .command('frame <frameName>')
    .description('create frame')
    .action(function(frameName) {
        tcy.add_frm(frameName);
    });

//create window + frame
commander
    .command('wf <name> <title>')
    .description('create frame')
    .action(function(name, title) {
        tcy.add_wf(name, title);
    });

commander.parse(process.argv);
