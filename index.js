#!/usr/bin/env node

const bundle = require('./bundle');
const zip = require('./zip');
const install = require('./install');

console.log('Started webpack bundle');
bundle(function (err) {
    if (err) return console.error('Error', err);
    console.log('Completed webpack bundle');
    console.log('Started zip');
    zip(function (err) {
        if (err) return console.error('Error', err);
        console.log('Completed zip');
        const host = 'localhost';
        const companyId = '37004';
        const port = 3000;
        if (host) {
            console.log('Started install');
            install(host, companyId, port, function (err) {
                if (err) return console.error('Error', err);
                console.log('Completed install');
            });
        }
    });
});
