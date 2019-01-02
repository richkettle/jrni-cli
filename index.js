#!/usr/bin/env node

const install = require('./install');
const initialize = require('./initialize');
const tail = require('./tail');
const logger = require('./logger');
const uninstall = require('./uninstall');

const newOptions = require('./new-options.json');
const defaultOptions = require('./default-options.json');

const yargs = require('yargs');
const fs = require('fs-extra');
const path = require('path');

const newBuilder = (newYargs) => {
    newYargs
        .positional('dir', {
            describe: 'Destination directory',
            type: 'string'
        })
        .options(newOptions)
}

const tailBuilder = (tailYargs) => {
    tailYargs
        .positional('script', {
            describe: 'Name of script',
            type: 'string'
        })
        .options(defaultOptions)
}

const config = fs.readJsonSync(path.join(process.cwd(), '.bbugrc'), {throws: false}) || {};

yargs
    .usage('Usage: $0 <command>')
    .command(['$0', 'install'], 'Package and install app', defaultOptions, install)
    .command('new <dir>', 'Initialize a new app', newBuilder, initialize)
    .command('tail', 'Show script logs', tailBuilder, tail)
    .command('uninstall', 'Uninstall a app', defaultOptions, uninstall)
    .config(config)
    .argv;

