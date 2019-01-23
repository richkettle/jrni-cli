const chalk = require('chalk')

function indent (message) {
 return message.trim().replace(/^/mg, '       ').replace(/^\s+/, '')
}

const logger = {}
logger.info = (message) => console.log(`${chalk.blue('[INFO]')} ${indent(message)}`)
logger.warn = (message) => console.warn(chalk.yellow(`[WARN] ${indent(message)}`))
logger.fatal = (message) => console.error(chalk.red(`[FATAL] ${indent(message)}`))
module.exports = logger
