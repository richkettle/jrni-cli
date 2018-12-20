#!/usr/bin/env node

const bundle = require('./bundle');
const zip = require('./zip');
const install = require('./install');
const authenticate = require('./authenticate');
const initialize = require('./initialize');
const tail = require('./tail');
const Configuration = require('./configuration');
const newOptions = require('./new.json');
const configureApp = require('./configure-app');
const logger = require('./logger');
const uninstall = require('./uninstall');

const yargs = require('yargs');

const packageAndInstall = (argv) => {
    const projectRootPath = process.cwd();
    const configuration = new Configuration(projectRootPath, argv);
    configuration.validate(function (err) {
        if (err === 'Missing auth') {
            return yargs.showHelp();
        } else if (err) {
            return logger.fatal(err);
        }
        configuration.promptConfig().then(() => {
            authenticate(configuration).then((configuration) => {
                logger.info('Started webpack bundle');
                bundle(configuration, function (err) {
                    if (err) return logger.fatal(err);
                    logger.info('Completed webpack bundle');
                    logger.info('Started zip');
                    zip(function (err) {
                        if (err) return logger.fatal(err);
                        logger.info('Completed zip');
                        logger.info('Started install');
                        install(configuration, function (err) {
                            if (err) return logger.fatal(err);
                            logger.info('Completed install');
                            if (configuration.appConfig) {
                                logger.info('Started config');
                                configureApp(configuration, function (err) {
                                    if (err) return logger.fatal(err);
                                    logger.info('Completed config');
                                });
                            }
                        });
                    });
                });
            }, logger.fatal);
        });
    });
}

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

yargs
    .usage('Usage: $0 <command>')
    .command('$0', 'Package and install app', installOptions, packageAndInstall)
    .command('new <dir>', 'Initialize a new app', newBuilder, initialize)
    .command('tail', 'Show script logs', tailBuilder, tail)
    .command('uninstall', 'Uninstall a app', installOptions, uninstall)
    .argv;

