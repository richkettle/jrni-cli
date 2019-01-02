const fs = require('fs');
const path = require('path');
const os = require('os');
const archiver = require('archiver');
const archive = archiver('zip');

const logger = require('./logger');

async function zip() {
    return new Promise((resolve, reject) => {
        logger.info('Started zip');
        const output = fs.createWriteStream(path.join(os.tmpdir(), 'app.zip'));
        const dir = path.basename(process.cwd());
        logger.info(process.cwd());
        process.chdir('..');
        output.on('close', function () {
            logger.info(archive.pointer() + ' total bytes');
            logger.info('Completed zip');
            resolve();
        });
        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                logger.warn(err.message);
            } else {
                reject(err);
            }
        });
        archive.on('error', function (err){
            reject(err);
        });
        archive.pipe(output);
        archive.glob(`${dir}/**`);
        archive.finalize();
    });
}

module.exports = zip;
