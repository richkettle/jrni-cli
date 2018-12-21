const argv = require('yargs').argv;
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const Ajv = require('ajv');
const ajv = new Ajv({verbose: true});
const yargs = require('yargs');

const logger = require('./logger');

class Configuration {
    constructor(rootPath, argv) {

        this.rootPath = rootPath;

        this._validatePanelStructure();

        this.manifest = require(path.resolve(this.rootPath, 'manifest.json'));

        this._validateManifest();

        this.bbugrcPath = path.join(process.cwd(), '.bbugrc');

        this.email = argv.email;
        this.password = argv.password;
        this.host = argv.host;
        this.companyId = argv.companyId && argv.companyId.toString();
        this.port = argv.port;
        this.dev = argv.dev;
        this.name = this.manifest.unique_name;
        this.appId = '302e48d75f4b55016aaf2c81f5ddf80f039e3f863277';
        this.configSchema = fs.readJsonSync(path.join(process.cwd(), 'config.json'), { throws: false });
    }

    _validatePanelStructure(){
        if (!fs.existsSync(path.resolve(this.rootPath, 'entry.js'))) {
            logger.fatal('Please define entry.js file within the panel package!');
            process.exit(0);
        }

        if (!fs.existsSync(path.resolve(this.rootPath, 'manifest.json'))) {
            logger.fatal('Please define manifest.json file within the panel package!');
            process.exit(0);
        }
    }

    _validateManifest(){
        if(!!this.manifest.unique_name === false){
            logger.fatal('manifest.json file must define unique_name property');
            process.exit(0);
        }
    }

    isDev(){
        this.dev === true;
    }

    _mapSchemaToQuestions(schema) {
        return Object.entries(schema.properties).reduce((list, pair) => {
            const [name, item] = pair;
            list.push({
                type: 'input',
                name: name,
                message: item.description
            });
            return list
        }, []);
    }

    promptConfig() {
        const config = fs.readJsonSync(path.join(process.cwd(), '.bbugrc'), {throws: false});
        if (config) this.appConfig = config.appConfig;
        if (this.appConfig) {
            return Promise.resolve();
        } else {
            return new Promise((resolve, reject) => {
                if (this.configSchema) {
                    if (!this.configSchema.properties) {
                        logger.warn('config.json has no properties');
                        resolve();
                    }
                    console.log("\nApp config\n");
                    const questions = this._mapSchemaToQuestions(this.configSchema);
                    inquirer.prompt(questions).then(answers => {
                        this.appConfig = answers;
                        resolve()
                    }, reject);
                } else {
                    resolve();
                }
            })
        }
    }

    validate() {
        return new Promise((resolve, reject) => {
            if (this.email && this.password && this.host) {
                if (this.configSchema) {
                    if (ajv.validateSchema(this.configSchema)) {
                        resolve();
                    } else {
                        reject('config.json is not valid json schema');
                    }
                } else {
                    resolve();
                }
            } else {
                reject('Missing auth');
            }
        });
    }

    writeToFile() {
        return fs.outputJson(this.bbugrcPath, {
            email: this.email,
            password: this.password,
            companyId: this.company_id,
            host: this.host,
            port: this.port,
            appConfig: this.appConfig
        }, {spaces: 2});
    }
}

module.exports = Configuration;
