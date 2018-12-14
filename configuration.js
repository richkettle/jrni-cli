const argv = require('yargs').argv;
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class Configuration {
    constructor(rootPath, argv) {

        this.rootPath = rootPath;

        this._validatePanelStructure();

        this.manifest = require(path.resolve(this.rootPath, 'manifest.json'));

        this._validateManifest();

        this.host = argv.host;
        this.companyId = argv.companyId.toString();
        this.port = argv.port;
        this.appId = argv.appId;
        this.appKey = argv.appKey;
        this.authToken = argv.authToken;
        this.dev = argv.dev;
        this.name = this.manifest.unique_name;
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
}

module.exports = Configuration;
