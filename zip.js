const fs = require('fs');
const path = require('path');
const os = require('os');
const archiver = require('archiver');
const archive = archiver('zip');

function zip(cb) {
    const output = fs.createWriteStream(path.join(os.tmpdir(), 'app.zip'));
    const dir = path.basename(process.cwd());
    console.log(process.cwd());
    process.chdir('..');
    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        cb();
    });
    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            console.warn(err.message);
        } else {
            cb(err);
        }
    });
    archive.on('error', function (err){
        cb(err);
    });
    archive.pipe(output);
    archive.glob(`${dir}/**`);
    archive.finalize();
}

module.exports = zip;
