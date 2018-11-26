#!/usr/bin/env node

const bundle = require('./bundle');
const zip = require('./zip');
const install = require('./install');
const Configuration = require('./configuration');
const chalk = require('chalk');
const yargs = require('yargs');

const packageAndInstall = (argv) => {
    const projectRootPath = process.cwd();
    const configuration = new Configuration(projectRootPath, argv);
    console.log('Started webpack bundle');
    bundle(configuration, function (err) {
        if (err) return console.log(chalk.red(err));
        console.log('Completed webpack bundle');
        console.log('Started zip');
        zip(function (err) {
            if (err) return console.log(chalk.red(err));
            console.log('Completed zip');
            console.log('Started install');
            install(configuration, function (err) {
                if (err) return console.log(chalk.red(err));
                console.log('Completed install');
            });
        });
    });
}

yargs
    .usage('Usage: $0 --host [string] --company-id [num] --port [num] --app-id [string] --auth-token [string]')
    .command('$0', 'Package and install app', (yargs) => {
        return yargs
            .option('dev', {
                describe: 'Do not apply production optimisations',
                type: 'boolean'
            })
            .option('host', {
                demandOption: true,
                describe: 'Destination host server for app install',
                type: 'string'
            })
            .option('company-id', {
                demandOption: true,
                describe: 'Destination company for app install',
                type: 'num'
            })
            .option('port', {
                describe: 'HTTP port to use for app install',
                default: 443,
                type: 'num'
            })
            .option('app-id', {
                demandOption: true,
                describe: 'App-Id to use for app install',
                type: 'string'
            })
            .option('auth-token', {
                demandOption: true,
                describe: 'Auth-Token to use for app install',
                type: 'string'
            })
    }, packageAndInstall)
    .example('$0 --host uk.bookingbug.com --company-id 21')
    .help('help')
    .argv

