const https = require('https');
const http = require('http');
const inquirer = require('inquirer');
const fs = require('fs');

const promptForCompany = (companies, configuration, cb) => {
    const questions = [{
        type: 'list',
        name: 'companyId',
        message: 'Which company should the app be installed to?',
        paginated: true,
        choices: companies
    }];
    inquirer.prompt(questions).then(answers => {
        configuration.companyId = answers.companyId
        authenticate(configuration, cb);
    });
}

const authenticate = (configuration, cb) => {
    const data = JSON.stringify({
        email: configuration.email,
        password: configuration.password
    });
    const protocol = configuration.port === 443 ? https : http;
    const URL = configuration.companyId ? `/api/v1/login/admin/${configuration.companyId}` : '/api/v1/login/admin'
    const options = {
        host: configuration.host,
        port: configuration.port || 443,
        path: URL,
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
            const json = JSON.parse(output);
            if (statusCode >= 200 && statusCode <= 300) {
                configuration.authToken = json.auth_token;
                configuration.companyId = json.company_id;
                const credentials = JSON.stringify({
                    email: configuration.email,
                    password: configuration.password,
                    companyId: json.company_id,
                    host: configuration.host,
                    port: configuration.port
                }, null, 2);
                fs.writeFile(configuration.bbugrcPath, credentials, cb);
            } else if (statusCode === 400 && json._embedded) {
                const companies = json._embedded.administrators.map((admin) => {
                    return {
                        name: admin.company_name,
                        value: admin.company_id
                    };
                });
                promptForCompany(companies, configuration, cb);
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
