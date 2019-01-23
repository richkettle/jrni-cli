const axios = require('axios');

const logger = require('../classes/logger');

async function configureApp(configuration) {
    logger.info('Started config');
    const data = JSON.stringify(configuration.appConfig);
    logger.info(`Config: '${data}'`);
    const protocol = configuration.port === 443 ? 'https' : 'http';
    const URL = `/api/v1/admin/${configuration.companyId}/apps/${configuration.appId}/configure`;
    await axios({
        method: 'post',
        url: URL,
        baseURL: `${protocol}://${configuration.host}:${configuration.port}`,
        data: data,
        headers: {
            'App-Id': configuration.clientId,
            'Auth-Token': configuration.authToken,
            'Content-Type': 'application/json',
            'Content-Length': data.length
        },
        responseType: 'json'
    });
    logger.info('Completed config');
}

module.exports = configureApp;
