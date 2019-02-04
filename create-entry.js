const fs = require('fs');

async function createPanelsEntry(configuration) {
    const content = configuration.manifest.panels.reduce((lines, folder) => {
        lines.push(`import './${folder}/**/!(*.spec).js'`);
        return lines;
    }, []).join("\n");
    if (content) {
        await new Promise((resolve, reject) => {
            fs.writeFile('entry.js', content, resolve);
        });
    }
}

async function createJextEntry(configuration) {
    const content = configuration.manifest.jext.reduce((lines, folder) => {
        lines.push(`import './${folder}/**/!(*.spec).js'`);
        return lines;
    }, []).join("\n");
    if (content) {
        await new Promise((resolve, reject) => {
            fs.writeFile('entry-jext.js', content, resolve);
        });
    }
}

async function createEntry(configuration) {
    if (configuration.manifest.panels) await createPanelsEntry(configuration);
    if (configuration.manifest.jext) await createJextEntry(configuration);
}

module.exports = createEntry;
