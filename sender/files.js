const fs = require('fs');
const path = require('path');
const containerFolder = 'contenitore';

module.exports = {
    getCurrentDirectoryBase: () => {
        return path.resolve(process.cwd());
    },

    directoryExists: (filePath) => {
        return fs.existsSync(filePath);
    },

    listFile: () => {
        let ar = [];
        fs.readdirSync(containerFolder).forEach((name) => {
            if (name.split('.').pop() === 'txt' || name.split('.').pop() === 'csv') {
                ar.push(name);
            }
        });
        return ar;
    },

    getContainerFolder() {
        return path.resolve(process.cwd()) + '/' + containerFolder.trim() + '/';
    }
};
