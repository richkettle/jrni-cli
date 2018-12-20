const https = require('https');
const http = require('http');
const yargs = require('yargs');
const axios = require('axios');

const Configuration = require('./configuration');
const authenticate = require('./authenticate');
const logger = require('./logger');

let shutdown = false;

const delay = ms => new Promise(r => setTimeout(r, ms));

async function getLogs(configuration, start_time = 0) {
    const protocol = configuration.port === 443 ? 'https' : 'http';
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
        json.forEach((logs) => {
            joinedLines = logs.reduce((joined, line) => joined + line.message, '');
            if (joinedLines != '') console.log(joinedLines);
        });
        await delay(2000);
        if (shutdown) {
            process.exit(0);
        } else {
            await getLogs(configuration, end_time);
        }
    } catch(error) {
        if (error.response) {
            throw error.response.error;
        } else {
            throw error.message;
        }
    }
}

function handleSignal() {
    shutdown = true;
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
                process.on('SIGINT', handleSignal);
                process.on('SIGTERM', handleSignal);
                logger.info('Tailing logs');
                console.log('');
                getLogs(configuration).then(() => {
                }, logger.fatal);
            }, logger.fatal);
        });
    });
}

