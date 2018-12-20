const https = require('https');
const http = require('http');
const yargs = require('yargs');

const Configuration = require('./configuration');
const authenticate = require('./authenticate');
const logger = require('./logger');

const getLogs = (configuration, cb) => {
    const protocol = configuration.port === 443 ? https : http;
    const start_time = 0;
    const end_time = new Date().getTime();
    const options = {
        host: configuration.host,
        port: configuration.port || 443,
        path: `/api/v1/admin/${configuration.companyId}/apps/${configuration.name}/logs?start_time=${start_time}&end_time=${end_time}`,
        method: 'GET',
        headers: {
            'App-Id': configuration.appId,
            'Auth-Token': configuration.authToken
        }
    };
    const request = protocol.request(options, (response) => {
        const statusCode = response.statusCode;
        let output = '';
        response.on('data', (chunk) => {
            output += chunk;
        });
        response.on('error', (error) => {
            cb(error);
        })
        response.on('end', () => {
            const json = JSON.parse(output);
            if (statusCode >= 200 && statusCode <= 300) {
                console.log('');
                json.forEach((logs) => {
                    console.log(logs.reduce((joined, line) => joined + line.message, ''));
                });
            } else if (json.error) {
                cb(json.error);
            } else {
                cb(output);
            }
        });
    });
    request.end();
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
            logger.info('Started authorization');
            authenticate(configuration, function (err) {
                if (err) return logger.fatal(err);
                logger.info('Completed authorization');
                getLogs(configuration, function (err) {
                    if (err) return logger.fatal(err);
                });
            });
        });
    });
}

