const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

const newOptions = require('./new.json');

const log = (message) => {
    console.log(chalk.blue(message));
}

const questions = Object.entries(newOptions).reduce((list, pair) => {
    const [name, question] = pair;
    list.push({
        type: 'input',
        name: name,
        message: question.describe
    })
    return list
}, []);

const filterQuestions = (argv) => {
    return questions.filter(question => !argv.hasOwnProperty(question.name));
}

const createFiles = (argv) => {
    log('Started new app');
    fs.mkdirpSync(argv.dir);
    const manifest = {
        bbAppManifestVersion: '1.0',
        name: argv.name,
        author: argv.author,
        panels: [],
        objects: [],
        scripts: [],
        liquid: []
    }
    fs.outputJsonSync(path.join(argv.dir,'manifest.json'), manifest, {spaces: 2});
    log('Completed new app');
}

module.exports = (argv) => {
    inquirer.prompt(filterQuestions(argv)).then(answers => {
        argv = Object.assign(argv, answers);
        createFiles(argv);
    });
}

