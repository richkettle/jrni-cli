const chalk = require('chalk');

const logger = {};
logger.info = (message) => console.log(`${chalk.blue('[INFO]')} ${message}`);
logger.warn = (message) => console.warn(chalk.yellow(`[WARN] ${message}`));
logger.fatal = (message) => console.error(chalk.red(`[FATAL] ${message}`));
module.exports = logger;
