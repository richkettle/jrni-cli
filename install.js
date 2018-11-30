const path = require('path');
const os = require('os');
const fs = require('fs');
const FormData = require('form-data');

install = (configuration, cb) => {
    const filePath = path.join(os.tmpdir(), 'app.zip');
    const readStream = fs.createReadStream(filePath);
    const form = new FormData();
    form.append('file', readStream);
    const options = {
        protocol: configuration.port === 443 ? 'https:' : 'http:',
        host: configuration.host,
        port: configuration.port || 443,
        path: `/api/v1/admin/${configuration.companyId}/apps`,
        method: 'POST',
        headers: {
            'App-Id': configuration.appId,
            'App-Key': configuration.appKey,
            'Auth-Token': configuration.authToken
        }
    }
    form.submit(options, (error, response) => {
        if (error) cb(error);
        const statusCode = response.statusCode;
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            if (statusCode >= 200 && statusCode <= 300) {
                cb();
            } else {
                cb(data);
            }
        });
    });
}

module.exports = install;
