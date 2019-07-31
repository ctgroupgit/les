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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, OnChanges {

  public displayedColumns = ['name', 'pathFile'];
  public dataSource = new MatTableDataSource<string>();
  newFileBuffer: Subscription;
  modelFolder: string;
  IP;
  USER;
  downloadPath;

  constructor(private electron: ElectronService,
              private sock: SockService,
              private localStorage: LocalStorageService,
              private pdf: PdfGenerationService) {

    this.downloadPath = path.join(this.electron.remote.app.getPath('appData'), this.electron.remote.app.getName(), 'downloadData');
    if (!this.electron.fs.existsSync(this.downloadPath)) {
      this.electron.fs.mkdirSync(this.downloadPath);
    }

    if (isDevMode()) {
      this.IP = '192.168.1.119:22';
      this.USER = 'andrea:123';
    } else {
      this.IP = (this.localStorage.retrieve('serverIp') === 'undefined') ? '10.76.139.29' : this.localStorage.retrieve('serverIp');
      const us = (this.localStorage.retrieve('username') === 'undefined') ? 'root' : this.localStorage.retrieve('username');
      const ps = (this.localStorage.retrieve('password') === 'undefined') ? 'hp' : this.localStorage.retrieve('password');
      this.USER = us + ':' + ps;
    }

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
        console.log(cmd);
        this.electron.childProcess.exec(cmd, (error, stdout, stderr) => {
          if (error) {
            console.error('exec error: ', stderr);
            return;
          } else {
            this.printPdf();
            this.scanDir();
            if (!isDevMode()) {
              this.electron.remote.getCurrentWindow().reload();
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
      console.log(file);
      templateLists.push({name: file.toString(), pathFile: path.join(historyPath, file)});
    });
    console.log(templateLists);
    this.dataSource.data = templateLists;
  }

  public printPdf() {
    const pathFile = path.join(this.downloadPath, 'data.csv');

    const buffer = this.electron.fs.readFileSync(pathFile);
    console.log(String.fromCharCode.apply(null, new Uint16Array(buffer)));
    const tempParse = this.csv2Array(String.fromCharCode.apply(null, new Uint16Array(buffer)));
    this.pdf.printOrder(tempParse);
  }

  public viewHistoryPdf(filePath: string) {
    console.log(filePath['pathFile']);
    this.electron.childProcess.exec(this.getCommandLine() + ' ' + filePath['pathFile'], (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: error`);
        return;
      }
    });
  }

  getCommandLine() {
    switch (process.platform) {
      case 'darwin' :
        return 'open ';
      case 'win32' :
        return 'start ';
      default :
        return 'xdg-open ';
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
        // console.log(tarr);
        lines.push(tarr);
      }
    }
    return lines;
  }
}

