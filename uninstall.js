const https = require('https');
const http = require('http');
const yargs = require('yargs');
const axios = require('axios');

const Configuration = require('./configuration');
const authenticate = require('./authenticate');
const logger = require('./logger');

async function uninstallRequest(configuration) {
    logger.info('Started uninstall');
    const protocol = configuration.port === 443 ? 'https' : 'http';
    const URL = `/api/v1/admin/${configuration.companyId}/apps/${configuration.name}`;
    try {
        const response = await axios({
            method: 'delete',
            url: URL,
            baseURL: `${protocol}://${configuration.host}:${configuration.port}`,
            headers: {
                'App-Id': configuration.appId,
                'Auth-Token': configuration.authToken
            }
        });
        logger.info('Completed uninstall');
    } catch(error) {
        if (error.response) {
            throw error.response.data.error;
        } else {
            throw error.message;
        }
    }
}

module.exports = (argv) => {
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
                uninstallRequest(configuration).then(() => {
                }, logger.fatal);
            }, logger.fatal);
        });
    });
}

