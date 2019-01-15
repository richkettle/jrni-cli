const https = require('https');
const http = require('http');
const yargs = require('yargs');
const axios = require('axios');

const Configuration = require('../classes/Configuration');
const authenticate = require('./authenticate');
const logger = require('../classes/logger');

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

async function command(argv) {
    try {
        const projectRootPath = process.cwd();
        const configuration = new Configuration(projectRootPath, argv);
        await authenticate(configuration);
        await uninstallRequest(configuration);
    } catch(error) {
        if (error.response && error.response.data) {
            logger.fatal(error.response.data.error || error.response.data);
        }
        logger.fatal(error.stack ? error.stack : error);
    }
}

module.exports = command;

