const path = require('path');
const os = require('os');
const fs = require('fs');
const FormData = require('form-data');

install = (host, companyId, port, cb) => {
    const filePath = path.join(os.tmpdir(), 'app.zip');
    const readStream = fs.createReadStream(filePath);
    const form = new FormData();
    form.append('file', readStream);
    const options = {
        host: host,
        port: port || 443,
        path: `/api/v1/admin/${companyId}/apps`,
        method: 'POST',
        headers: {
            'App-Id': '2a0a56286e4e618bcbfe0bf252891b2c4dedad3dc5f7',
            'Auth-Token': 'vDCoZ6zBK7pz_WY_aKrowA'
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
