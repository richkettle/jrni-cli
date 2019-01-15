const path = require('path');
const os = require('os');
const fs = require('fs');
const FormData = require('form-data');

const Configuration = require('../classes/Configuration');
const bundle = require('./bundle');
const zip = require('./zip');
const authenticate = require('./authenticate');
const configureApp = require('./configure-app');
const createEntry = require('./create-entry');
const logger = require('../classes/logger');

async function submitForm(configuration) {
    return new Promise((resolve, reject) => {
        logger.info('Started install');
        const filePath = path.join(os.tmpdir(), 'app.zip');
        const readStream = fs.createReadStream(filePath);
        const form = new FormData();
        logger.info(`host: ${configuration.host}, companyId: ${configuration.companyId}`);
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

async function packageAndInstall(argv) {
    try {
        const projectRootPath = process.cwd();
        let configuration = new Configuration(projectRootPath, argv);
        await configuration.validate();
        await configuration.promptConfig();
        await authenticate(configuration);
        await createEntry(configuration);
        await bundle(configuration);
        await zip();
        await submitForm(configuration);
        if (configuration.appConfig) {
            await configureApp(configuration);
        }
    } catch(error) {
        if (error.response && error.response.data) {
            logger.fatal(error.response.data.error || error.response.data);
        }
        logger.fatal(error.stack ? error.stack : error);
    }
}

module.exports = packageAndInstall;
