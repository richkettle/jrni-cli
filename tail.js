const https = require('https');
const http = require('http');
const yargs = require('yargs');
const axios = require('axios');

const Configuration = require('./configuration');
const authenticate = require('./authenticate');
const logger = require('./logger');

async function getLogs(configuration) {
    const protocol = configuration.port === 443 ? 'https' : 'http';
    const start_time = 0;
    const end_time = new Date().getTime();
    const URL = `/api/v1/admin/${configuration.companyId}/apps/${configuration.name}/logs?start_time=${start_time}&end_time=${end_time}`;
    try {
        const response = await axios({
            method: 'get',
            url: URL,
            baseURL: `${protocol}://${configuration.host}:${configuration.port}`,
            headers: {
                'App-Id': configuration.appId,
                'Auth-Token': configuration.authToken
            },
            responseType: 'json'
        });
        const json = response.data;
        console.log('');
        json.forEach((logs) => {
            console.log(logs.reduce((joined, line) => joined + line.message, ''));
        });
    } catch(error) {
        if (error.response) {
            throw error.response.error;
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
                getLogs(configuration).then(() => {
                }, logger.fatal);
            }, logger.fatal);
        });
    });
}

