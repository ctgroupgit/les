#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const files = require('./files');
const inquirer = require('inquirer');
const net = require('net');
const { exec } = require('child_process');
const alert = require('alert-node');


const client = new net.Socket();
client.on('error', () => {
    return false;
});

if (!files.directoryExists('./contenitore')) {
    console.log(chalk.red('Non trovo la cartella contentente i file!'));
    process.exit();
}
clear();
const run = async () => {
    clear();
    console.log(
        chalk.blue(
            figlet.textSync('LesEnder', {horizontalLayout: 'full'})
        )
    );
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'file',
                message: 'Seleziona il File da inviare a LES',
                choices: files.listFile(),
            },
        ])
        .then(answers => {
            if (answers.file.split('.').pop() === 'csv'){
                exec('xdg-open ' + files.getContainerFolder() + answers.file, (err, stdout, stderr) => {
                    if (err){
                        alert(stderr)
                    }
                });
            } else {
                client.connect(8010, '127.0.0.1', function () {
                    client.write('/cmd ' + files.getContainerFolder() + answers.file);
                    client.end();
                });
            }
            run();
        });
};

run();
