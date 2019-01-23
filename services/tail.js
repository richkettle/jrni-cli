const https = require('https');
const http = require('http');
const yargs = require('yargs');
const axios = require('axios');

const Configuration = require('../classes/Configuration');
const authenticate = require('./authenticate');
const logger = require('../classes/logger');

let shutdown = false;

const delay = ms => new Promise(r => setTimeout(r, ms));

async function getLogs (configuration, start_time = 0) {
    const protocol = configuration.port === 443 ? 'https' : 'http';
    const end_time = new Date().getTime();
    const URL = `/api/v1/admin/${configuration.companyId}/apps/${configuration.appId}/logs?start_time=${start_time}&end_time=${end_time}`;
    try {
        const response = await axios({
            method: 'get',
            url: URL,
            baseURL: `${protocol}://${configuration.host}:${configuration.port}`,
            headers: {
                'App-Id': configuration.clientId,
                'Auth-Token': configuration.authToken
            },
            responseType: 'json'
        });
        const json = response.data;
        json.forEach((logs) => {
            const joinedLines = logs.reduce((joined, line) => joined + line.message, '');
            if (joinedLines) console.log(joinedLines);
        });
        await delay(2000);
        if (shutdown) {
            process.exit(0);
        } else {
            await getLogs(configuration, end_time);
        }
    } catch (error) {
        if (error.response) {
            throw error.response.data;
        } else {
            throw error.message;
        }
    }
}

function handleSignal () {
    shutdown = true;
}

module.exports = async function (argv) {
    try {
        const projectRootPath = process.cwd();
        const configuration = new Configuration(projectRootPath, argv);
        await configuration.validate();
        await configuration.promptConfig();
        await authenticate(configuration);
        process.on('SIGINT', handleSignal);
        process.on('SIGTERM', handleSignal);
        logger.info('Tailing logs');
        console.log('');
        await getLogs(configuration);
    } catch (error) {
        logger.fatal(error);
    }
}

