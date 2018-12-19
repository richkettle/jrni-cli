const https = require('https');
const http = require('http');

const fs = require('fs');

const authenticate = (configuration, cb) => {
    const data = JSON.stringify({
        email: configuration.email,
        password: configuration.password
    });
    const protocol = configuration.port === 443 ? https : http;
    const options = {
        host: configuration.host,
        port: configuration.port || 443,
        path: `/api/v1/login/admin/${configuration.companyId}`,
        method: 'POST',
        headers: {
            'App-Id': configuration.appId,
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
            console.log(output)
            const json = JSON.parse(output);
            if (statusCode >= 200 && statusCode <= 300) {
                configuration.authToken = json.auth_token;
                const credentials = JSON.stringify({
                    email: configuration.email,
                    password: configuration.password,
                    companyId: json.company_id,
                    host: configuration.host,
                    port: configuration.port
                }, null, 2);
                fs.writeFile('./.bbugrc', credentials, cb);
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

module.exports = authenticate;
