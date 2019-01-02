const axios = require('axios');

const logger = require('./logger');

async function configureApp(configuration) {
    logger.info('Started config');
    const data = JSON.stringify(configuration.appConfig);
    logger.info(`Config: '${data}'`);
    const protocol = configuration.port === 443 ? 'https' : 'http';
    const URL = `/api/v1/admin/${configuration.companyId}/apps/${configuration.name}/configure`;
    await axios({
        method: 'post',
        url: URL,
        baseURL: `${protocol}://${configuration.host}:${configuration.port}`,
        data: data,
        headers: {
            'App-Id': configuration.appId,
            'Auth-Token': configuration.authToken,
            'Content-Type': 'application/json',
            'Content-Length': data.length
        },
        responseType: 'json'
    });
    logger.info('Completed config');
}

module.exports = configureApp;
