#!/usr/bin/env node

const install = require('./services/install');
const initialize = require('./services/initialize');
const tail = require('./services/tail');
const logger = require('./classes/logger');
const uninstall = require('./services/uninstall');

const newOptions = require('./config/options/new-options.json');
const loginOptions = require('./config/options/login-options.json');

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
        .options(loginOptions)
}

const config = fs.readJsonSync(path.join(process.cwd(), '.bbugrc'), {throws: false}) || {};

yargs
    .usage('Usage: $0 <command>')
    .command(['$0', 'install'], 'Package and install app', loginOptions, install)
    .command('uninstall', 'Uninstall a app', loginOptions, uninstall)
    .command('new <dir>', 'Initialize a new app', newBuilder, initialize)
    .command('tail', 'Show script logs', tailBuilder, tail)
    .config(config)
    .argv;
