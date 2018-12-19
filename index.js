#!/usr/bin/env node

const bundle = require('./bundle');
const zip = require('./zip');
const install = require('./install');
const authenticate = require('./authenticate');
const initialize = require('./initialize');
const Configuration = require('./configuration');
const newOptions = require('./new.json');
const configureApp = require('./configure-app');

const chalk = require('chalk');
const yargs = require('yargs');

const packageAndInstall = (argv) => {
    const projectRootPath = process.cwd();
    const configuration = new Configuration(projectRootPath, argv);
    configuration.validate(function (err) {
        if (err === 'Missing auth') {
            return yargs.showHelp();
        } else if (err) {
            return console.log(chalk.red(err));
        }
        configuration.promptConfig().then(() => {
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
                            if (configuration.appConfig) {
                                console.log('Started config');
                                configureApp(configuration, function (err) {
                                    if (err) return console.log(chalk.red(err));
                                    console.log('Completed config');
                                });
                            }
                        });
                    });
                });
            });
        });
    });
}

const installBuilder = {
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

const newBuilder = (newYargs) => {
    newYargs
        .positional('dir', {
            describe: 'Destination directory',
            type: 'string'
        })
        .options(newOptions)
}

yargs
    .usage('Usage: $0 <command>')
    .command('$0', 'Package and install app', installBuilder, packageAndInstall)
    .command('new <dir>', 'Initialize a new app', newBuilder, initialize)
    .argv;

