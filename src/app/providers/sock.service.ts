import {Injectable} from '@angular/core';
import {ElectronService} from './electron.service';
import {BehaviorSubject} from 'rxjs';
import * as path from 'path';
import {LocalStorageService} from 'ngx-webstorage';
import {PdfGenerationService} from './pdf-generation.service';
import {GlobalService} from './global.service';
import {rootPath} from 'electron-root-path';


@Injectable()
export class SockService {

    sock: any;
    dati = new BehaviorSubject<any>(null);
    IP;
    USER;
    downloadPath;

    constructor(
        private _electron: ElectronService,
        private localStorage: LocalStorageService,
        private pdf: PdfGenerationService,
        private gb: GlobalService
    ) {

        this.downloadPath = path.join(this._electron.remote.app.getPath('appData'), this._electron.remote.app.getName(), 'downloadData');
        if (!this._electron.fs.existsSync(this.downloadPath)) {
            this._electron.fs.mkdirSync(this.downloadPath);
        }


        // this.IP = (this.localStorage.retrieve('serverIp') === 'undefined') ? '10.76.139.111' : this.localStorage.retrieve('serverIp');
        // const us = (this.localStorage.retrieve('username') === 'undefined') ? 'root' : this.localStorage.retrieve('username');
        // const ps = (this.localStorage.retrieve('password') === 'undefined') ? 'hp' : this.localStorage.retrieve('password');
        // this.USER = us + ':' + ps;

        this.sock = this._electron.net.createServer(socket => {
            socket.on('data', (data) => {
                // socket.write('Errn=0');
                socket.end();
                this.dati.next('');
                console.log(socket.remoteAddress + ' -> ' + data);

                let tempPath;
                let cmdPosition;
                let finalPath;
                tempPath = String.fromCharCode.apply(null, new Uint16Array(data));
                cmdPosition = tempPath.indexOf('/cmd') + 4;
                if (socket.remoteAddress === '127.0.0.1') {
                    finalPath = tempPath.substring(cmdPosition, tempPath.length);
                } else {
                    finalPath = tempPath.substring(cmdPosition, tempPath.length - 1);
                }

                let cmd;
                if (finalPath.length > 0) {
                    if (process.platform === 'win32') {
                        cmd = '"' + rootPath + '\\resources\\app\\bin\\curl.exe" -k "sftp://' + socket.remoteAddress + ':22' +
                            finalPath.trim() + '" --user "nova:nova" -o "' + this.downloadPath + '\\data.csv"';
                    } else {
                        cmd = 'curl -k "tftp://' + socket.remoteAddress + ':22' +
                            finalPath.trim() + '" --user "nova:nova" -o "' + this.downloadPath + '/data.csv"';
                    }
                    console.log(cmd);

                    this._electron.childProcess.exec(cmd, (error, stdout, stderr) => {
                        if (error) {
                            console.log(stderr);
                            return;
                        } else {
                            this.printPdf();
                        }
                    });
                }

            });
        });
        this.sock.listen(8010, '0.0.0.0');
    }

    public printPdf() {
        // console.log('PRINT PDF');
        const pathFile = path.join(this.downloadPath, 'data.csv');
        const buffer = this._electron.fs.readFileSync(pathFile);

        const tempParse = this.csv2Array(String.fromCharCode.apply(null, new Uint16Array(buffer)));
        let nome = '';

        tempParse.forEach((row) => {
            switch (row[1]) {
                case 'KOPIEN': {
                    nome += this.gb.deUmlaut(row[14]).trim();
                    break;
                }
                case 'KOPF': {
                    nome += '_' + this.gb.deUmlaut(row[18]).trim();
                    break;
                }
            }
        });
        nome += '.txt';
        this._electron.fs.copyFile(pathFile, path.join(this.downloadPath, nome), (error) => {
            if (error) {
                // const options = {
                //     type: 'error',
                //     buttons: ['OK'],
                //     title: 'Error Copy File',
                //     message: pathFile + '\n' + path.join(this.downloadPath, nome)
                // };
                // this.electron.remote.dialog.showMessageBox(null, options);
                console.log(error);
            } else {
                // if (this.electron.fs.existsSync(pathFile)) {
                this.pdf.print(tempParse);
                // this.electron.fs.unlinkSync(pathFile);
                // }
            }
        });
    }

    csv2Array(fileInput: any) {
        // const allTextLines = fileInput.split(/\r|\n|\r/);
        // const headers = allTextLines[0].split('|');
        // const lines = [];
        // console.log(allTextLines);
        // for (let i = 0; i < allTextLines.length; i++) {
        //   const data = allTextLines[i].split('|');
        //   if (data.length === headers.length) {
        //     const tarr = [];
        //     for (let j = 0; j < headers.length; j++) {
        //       tarr.push(data[j].replace(''));
        //     }
        //     // // console.log(tarr);
        //     lines.push(tarr);
        //   }
        // }

        const allTextLines = fileInput.split(/\r|\n|\r/);
        const lines = [];
        allTextLines.forEach(line => {
            lines.push(line.split('|'));
        });
        // console.log(lines);
        return lines;
    }

}
