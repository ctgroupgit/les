#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const files = require('./files');
const inquirer = require('inquirer');
const net = require('net');


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
            figlet.textSync('Sender', {horizontalLayout: 'full'})
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
            client.connect(8010, '127.0.0.1', function () {
                client.write('/cmd ' + files.getContainerFolder() + answers.file);
                client.end();
            });
            run();
        });
};

run();
