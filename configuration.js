const argv = require('yargs').argv;
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class Configuration {
    constructor(rootPath) {

        this.rootPath = rootPath;

        this._validatePanelStructure();

        this.manifest = require(path.resolve(this.rootPath, 'manifest.json'));

        this._validateManifest();

        this._validateAllowedOptions();
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

    _validateAllowedOptions() {
        const options = Object.assign({}, Configuration.allowedOptions, {
            _: 'required by argv',
            $0: 'required by argv',
            help: 'required by argv',
            version: 'required by argv'
        });

        for (const prop in argv) {
            if (options[prop] !== undefined) continue;
            this._displayNotAllowedOptionMsg(prop);
            this._displayAllowedOptions();
            process.exit(0);
        }
    }

    _displayNotAllowedOptionMsg(notAllowedOption) {
        console.log(chalk.red(`\n"--${notAllowedOption}" is not recognized option\n`));
    }

    _displayAllowedOptions() {
        console.log('Allowed options:')
        for (const option in Configuration.allowedOptions) {
            console.log(`   --${chalk.green(option)} : ${Configuration.allowedOptions[option]}`);
        }
        console.log('\n');
    }

    isDev(){
        return typeof argv.dev !== 'undefined';
    }
}

Configuration.allowedOptions = {
    dev: 'Do not apply production optimisations'
};

module.exports = Configuration;
