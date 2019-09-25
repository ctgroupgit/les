import {Component, OnInit, OnDestroy, OnChanges, SimpleChanges} from '@angular/core';
import {ElectronService} from '../../providers/electron.service';
import {SockService} from '../../providers/sock.service';
import {Subscription} from 'rxjs';
import {LocalStorageService} from 'ngx-webstorage';
import {MatTableDataSource} from '@angular/material';
import * as path from 'path';
import {PdfGenerationService} from '../../providers/pdf-generation.service';
import {rootPath} from 'electron-root-path';
import {isDevMode} from '@angular/core';
import {GlobalService} from '../../providers/global.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, OnChanges {

    public displayedColumns = ['order', 'name', 'pathFile'];
    public dataSource = new MatTableDataSource<string>();
    newFileBuffer: Subscription;
    IP;
    USER;
    downloadPath;

    constructor(private electron: ElectronService,
                private sock: SockService,
                private localStorage: LocalStorageService,
                private pdf: PdfGenerationService,
                private gb: GlobalService) {

        this.downloadPath = path.join(this.electron.remote.app.getPath('appData'), this.electron.remote.app.getName(), 'downloadData');
        if (!this.electron.fs.existsSync(this.downloadPath)) {
            this.electron.fs.mkdirSync(this.downloadPath);
        }

        this.IP = (this.localStorage.retrieve('serverIp') === 'undefined') ? '10.76.139.29' : this.localStorage.retrieve('serverIp');
        const us = (this.localStorage.retrieve('username') === 'undefined') ? 'root' : this.localStorage.retrieve('username');
        const ps = (this.localStorage.retrieve('password') === 'undefined') ? 'hp' : this.localStorage.retrieve('password');
        this.USER = us + ':' + ps;

        this.newFileBuffer = this.sock.dati.subscribe((event) => {
            let tempPath;
            let cmdPosition;
            let finalPath;
            tempPath = String.fromCharCode.apply(null, new Uint16Array(event));
            cmdPosition = tempPath.indexOf('/cmd') + 4;
            finalPath = tempPath.substring(cmdPosition, tempPath.length - 1);

            let cmd;
            if (finalPath.length > 0) {
                if (process.platform === 'win32') {
                    cmd = '"' + rootPath + '\\resources\\app\\bin\\curl.exe" -k "sftp://' + this.IP +
                        finalPath.trim() + '" --user "' + this.USER + '" -o "' + this.downloadPath + '\\data.csv"';
                } else {
                    cmd = 'curl -k "sftp://' + this.IP + finalPath.trim() + '" --user "' + this.USER + '" -o "' + this.downloadPath + '/data.csv"';
                }
                // console.log(cmd);
                this.electron.childProcess.exec(cmd, (error, stdout, stderr) => {
                    if (error) {
                        const options = {
                            type: 'error',
                            buttons: ['OK'],
                            title: 'Error Copy File',
                            message: stdout + '\n' + stderr
                        };
                        this.electron.remote.dialog.showMessageBox(null, options);
                        return;
                    } else {
                        this.printPdf();
                        this.scanDir();
                        if (this.localStorage.retrieve('automaticOpenPDF')) {
                            // this.electron.remote.getCurrentWindow().reload();
                        }
                    }
                });
            }
        });
    }

    ngOnInit() {
        this.scanDir();
    }

    ngOnDestroy() {
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    public scanDir() {
        const historyPath = path.join(this.electron.remote.app.getPath('appData'), this.electron.remote.app.getName(), 'history');
        if (!this.electron.fs.existsSync(historyPath)) {
            this.electron.fs.mkdirSync(historyPath);
        }
        const templateLists: any = [];
        this.electron.fs.readdirSync(historyPath).forEach((file) => {
            // console.log(file);
            templateLists.push({
                order: file.split('_').pop().replace('.pdf', ''),
                name: file.toString(),
                pathFile: path.join(historyPath, file)
            });
        });
        // console.log(templateLists);
        this.dataSource.data = templateLists.sort(function (obj1, obj2) {
            return obj2.order - obj1.order;
        });
    }

    public printPdf() {
        const pathFile = path.join(this.downloadPath, 'data.csv');
        const buffer = this.electron.fs.readFileSync(pathFile);
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
        this.electron.fs.copyFile(pathFile, path.join(this.downloadPath, nome), (error) => {
            if (error) {
                const options = {
                    type: 'error',
                    buttons: ['OK'],
                    title: 'Error Copy File',
                    message: pathFile + '\n' + path.join(this.downloadPath, nome)
                };
                this.electron.remote.dialog.showMessageBox(null, options);
            } else {
                this.pdf.print(tempParse);
            }
        });
    }

    public viewHistoryPdf(filePath: string) {
        this.electron.childProcess.exec(this.getCommandLine() + '"' + filePath['pathFile'] + '"', (error, stdout, stderr) => {
            if (error) {
                const options = {
                    type: 'error',
                    buttons: ['OK'],
                    title: 'Error Copy File',
                    message: stdout + '\n' + stderr
                };
                this.electron.remote.dialog.showMessageBox(null, options);
                return;
            }
        });
    }

    getCommandLine() {
        switch (process.platform) {
            case 'darwin' :
                return 'open ';
            case 'win32' :
                return 'START ';
            default :
                return 'START ';
        }
    }

    csv2Array(fileInput: any) {
        const allTextLines = fileInput.split(/\r|\n|\r/);
        const headers = allTextLines[0].split('|');
        const lines = [];

        for (let i = 0; i < allTextLines.length; i++) {
            const data = allTextLines[i].split('|');
            if (data.length === headers.length) {
                const tarr = [];
                for (let j = 0; j < headers.length; j++) {
                    tarr.push(data[j]);
                }
                // // console.log(tarr);
                lines.push(tarr);
            }
        }
        return lines;
    }
}

