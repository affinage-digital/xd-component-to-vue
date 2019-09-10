const application = require('application');
const { localFileSystem, formats } = require('uxp').storage;
const { svgo } = require('../libs/svgo');

const parseSVG = node => {
    return localFileSystem.getTemporaryFolder().then(tempFolder => {
        return tempFolder.createFile('export-svg-temp-file.svg', { overwrite: true }).then(tempFile => {
            return application.createRenditions([{
                node,
                outputFile: tempFile,
                type: 'svg',
                scale: 1,
                minify: false,
                embedImages: true,
            }]).then(results => {
                return results[0].outputFile.read({ format: formats.utf8 }).then(string => {
                    return svgo(string).data;
                });
            });
        });
    });
};

exports.parseSVG = parseSVG;
