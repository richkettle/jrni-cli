#!/usr/bin/env node

const bundle = require('./bundle');
const zip = require('./zip');
const install = require('./install');
const initialize = require('./initialize');
const tail = require('./tail');
const newOptions = require('./new.json');
const logger = require('./logger');
const uninstall = require('./uninstall');

const yargs = require('yargs');
const fs = require('fs-extra');
const path = require('path');

const installOptions = {
    email: {
        describe: 'Email address used to log into BookingBug',
        type: 'string'
    },
    password: {
        describe: 'Password used to log into BookingBug',
        type: 'string'
    },
    dev: {
        describe: 'Do not apply production optimisations',
        type: 'boolean'
    },
    host: {
        describe: 'Destination host server for app install',
        type: 'string'
    },
    companyId: {
        describe: 'Destination company for app install',
        type: 'num'
    },
    port: {
        describe: 'HTTP port to use for app install',
        type: 'num',
        default: 443

    }
}

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
        .options(installOptions)
}

const config = fs.readJsonSync(path.join(process.cwd(), '.bbugrc'), {throws: false}) || {};

yargs
    .usage('Usage: $0 <command>')
    .command(['$0', 'install'], 'Package and install app', installOptions, install)
    .command('new <dir>', 'Initialize a new app', newBuilder, initialize)
    .command('tail', 'Show script logs', tailBuilder, tail)
    .command('uninstall', 'Uninstall a app', installOptions, uninstall)
    .config(config)
    .argv;

