const https = require('https');
const http = require('http');

const logger = require('./logger');

module.exports = (configuration, cb) => {
    const data = JSON.stringify(configuration.appConfig);
    logger.info(`Config: '${data}'`);
    const protocol = configuration.port === 443 ? https : http;
    const options = {
        host: configuration.host,
        port: configuration.port || 443,
        path: `/api/v1/admin/${configuration.companyId}/apps/${configuration.name}/configure`,
        method: 'POST',
        headers: {
            'App-Id': configuration.appId,
            'Auth-Token': configuration.authToken,
            'Content-Type': 'application/json',
            'Content-Length': data.length
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
                cb(null, json);
            } else if (json.error) {
                cb(json.error);
            } else {
                cb(output);
            }
        });
    });
    request.write(data);
    request.end();
}
