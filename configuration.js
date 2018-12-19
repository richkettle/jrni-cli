const argv = require('yargs').argv;
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const Ajv = require('ajv');
const ajv = new Ajv({verbose: true});

class Configuration {
    constructor(rootPath, argv) {

        this.rootPath = rootPath;

        this._validatePanelStructure();

        this.manifest = require(path.resolve(this.rootPath, 'manifest.json'));

        this._validateManifest();

        let config = {};
        try {
            config = fs.lstatSync('./.bbugrc').isFile() ? JSON.parse(fs.readFileSync('./.bbugrc')): {};
        } catch(err) {
        }

        this.email = config.email || argv.email;
        this.password = config.password || argv.password;
        this.host = config.host || argv.host;
        this.companyId = argv.companyId ? argv.companyId.toString() : config.companyId;
        this.port = config.port || argv.port;
        this.dev = argv.dev;
        this.name = this.manifest.unique_name;
        this.appId = '302e48d75f4b55016aaf2c81f5ddf80f039e3f863277';
    }

    _validatePanelStructure(){
        if (!fs.existsSync(path.resolve(this.rootPath, 'entry.js'))) {
            console.log(chalk.red('Please define entry.js file within the panel package!'));
            process.exit(0);
        }

        if (!fs.existsSync(path.resolve(this.rootPath, 'manifest.json'))) {
            console.log(chalk.red('Please define manifest.json file within the panel package!'));
            process.exit(0);
        }
    }

    _validateManifest(){
        if(!!this.manifest.unique_name === false){
            console.log(chalk.red('manifest.json file must define unique_name property'));
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
        return new Promise((resolve, reject) => {
            const configSchema = fs.readJsonSync('./config.json', { throws: false });
            if (configSchema) {
                if (!configSchema.properties) {
                    console.log(chalk.yellow('[WARN] config.json has no properties'));
                    resolve();
                }
                const questions = this._mapSchemaToQuestions(configSchema);
                inquirer.prompt(questions).then(answers => {
                    this.appConfig = answers;
                    resolve()
                }, reject);
            } else {
                resolve();
            }
        })
    }

    validate(cb) {
        if (this.email && this.password && this.host) {
            const configSchema = fs.readJsonSync('./config.json', { throws: false });
            if (ajv.validateSchema(configSchema)) {
                cb(null)
            } else {
                cb('config.json is not valid json schema');
            }
        } else {
            cb('Missing auth');
        }
    }
}

module.exports = Configuration;
