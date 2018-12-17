#!/usr/bin/env node

const bundle = require('./bundle');
const zip = require('./zip');
const install = require('./install');
const authenticate = require('./authenticate');
const Configuration = require('./configuration');

const chalk = require('chalk');
const yargs = require('yargs');

const packageAndInstall = (argv) => {
    const projectRootPath = process.cwd();
    const configuration = new Configuration(projectRootPath, argv);
    if (!configuration.isValid()) {
        return yargs.showHelp();
    }
    console.log('Started authorization');
    authenticate(configuration, function (err) {
        if (err) return console.log(chalk.red(err));
        console.log('Completed authorization');
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
    });
}

const builder = {
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
        type: 'num'
    }
}

yargs
    .usage('Usage: $0 <command>')
    .command('$0', 'Package and install app', builder, packageAndInstall)
    .argv;

