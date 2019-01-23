const argv = require('yargs').argv;
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const Ajv = require('ajv');
const ajv = new Ajv({verbose: true});
const yargs = require('yargs');

const logger = require('./logger');

function readSchema (name) {
    return fs.readJsonSync(path.join(__dirname, `../config/schema/${name}.schema.json`));
}

class Configuration {
    constructor(rootPath, argv) {

        this.rootPath = rootPath;
        this.manifest = require(path.resolve(this.rootPath, 'manifest.json'));

        // checks
        this._validateAppStructure();
        this._validateManifest();
        this._validateCustomObjects();

        // login
        this.host = argv.host;
        this.port = argv.port;
        this.email = argv.email;
        this.password = argv.password;

        // install
        this.clientId = '302e48d75f4b55016aaf2c81f5ddf80f039e3f863277';
        this.companyId = argv.companyId && argv.companyId.toString();
        this.appId = this.manifest.unique_name;

        // webpack
        this.dev = argv.dev;

        // app config
        this.bbugrcPath = path.join(process.cwd(), '.bbugrc');
        this.configSchema = fs.readJsonSync(path.join(process.cwd(), 'config.json'), { throws: false });
    }

    _validateAppStructure(){
        if (!fs.existsSync(path.resolve(this.rootPath, 'manifest.json'))) {
            logger.fatal('Please define manifest.json file within the app package!');
            process.exit(0);
        }
    }

    _validateManifest(){
        const schema = readSchema('manifest');
        const valid = ajv.validate(schema, this.manifest);
        if (!valid) {
            logger.fatal('manifest.json validation error');
            logger.fatal(ajv.errorsText());
            process.exit(0);
        }
    }

    _validateCustomObjects() {
        const schema = readSchema('custom-object-fields');
        if (this.manifest.objects) {
            this.manifest.objects.forEach((object) => {
                const fields = fs.readJsonSync(path.join(process.cwd(), object, 'fields.json'));
                const valid = ajv.validate(schema, fields);
                if (!valid) {
                    logger.fatal(`${object}/fields.json validation error`);
                    logger.fatal(ajv.errorsText());
                    process.exit(0);
                }
            });
        }
    }

    isDev(){
        return this.dev === true;
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
                    } else {
                        console.log("\nApp config\n");
                        const questions = this._mapSchemaToQuestions(this.configSchema);
                        inquirer.prompt(questions).then(answers => {
                            this.appConfig = answers;
                            resolve()
                        }, reject);
                    }
                } else {
                    resolve();
                }
            })
        }
    }

    promptAuth() {
        return new Promise((resolve, reject) => {
            console.log("\nBookingBug login\n");
            let questions = [{
                type: 'input',
                name: 'email',
                message: 'Email address used to log into BookingBug'
            }, {
                type: 'input',
                name: 'password',
                message: 'Password used to log into BookingBug'
            }, {
                type: 'input',
                name: 'host',
                message: 'Destination host server for app install'
            }];
            questions = questions.filter((question) => {
                return !this[question.name];
            });
            inquirer.prompt(questions).then(answers => {
                questions.forEach((question) => {
                    this[question.name] = answers[question.name];
                });
                resolve();
            }, reject);
        });

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
                this.promptAuth().then(resolve, reject);
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
