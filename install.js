const path = require('path');
const os = require('os');
const fs = require('fs');
const FormData = require('form-data');

const logger = require('./logger');

async function install(configuration) {
    return new Promise((resolve, reject) => {
        logger.info('Started install');
        const filePath = path.join(os.tmpdir(), 'app.zip');
        const readStream = fs.createReadStream(filePath);
        const form = new FormData();
        form.append('file', readStream);
        const options = {
            protocol: configuration.port === 443 ? 'https:' : 'http:',
            host: configuration.host,
            port: configuration.port || 443,
            path: `/api/v1/admin/${configuration.companyId}/apps/${configuration.name}`,
            method: 'PUT',
            headers: {
                'App-Id': configuration.appId,
                'Auth-Token': configuration.authToken
            }
        }
        form.submit(options, (error, response) => {
            if (error) reject(error);
            const statusCode = response.statusCode;
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                if (statusCode >= 200 && statusCode <= 300) {
                    logger.info('Completed install');
                    resolve();
                } else {
                    reject(data);
                }
            });
        });
    });
}

module.exports = install;
