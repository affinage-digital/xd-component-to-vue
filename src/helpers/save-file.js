const fs = require('uxp').storage.localFileSystem;

const saveComponentAsFile = (name, html) => {
    return fs.getFolder().then(folder => {
        return folder.createFile(name + '.vue', { overwrite: true }).then(file => {
            return file.write(html);
        });
    });
};

exports.saveComponentAsFile = saveComponentAsFile;
