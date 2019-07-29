import {Component, OnInit, OnDestroy, OnChanges, SimpleChanges} from '@angular/core';
import {ElectronService} from '../../providers/electron.service';
import {SockService} from '../../providers/sock.service';
import {Subscription} from 'rxjs';
import {LocalStorageService} from 'ngx-webstorage';
import {MatTableDataSource} from '@angular/material';
import * as path from 'path';
import {PdfGenerationService} from '../../providers/pdf-generation.service';
import {rootPath} from 'electron-root-path';

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

  constructor(private electron: ElectronService,
              private sock: SockService,
              private localStorage: LocalStorageService,
              private pdf: PdfGenerationService) {

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
          cmd = rootPath + '\\bin\\curl.exe -k "sftp://10.76.139.29:22' +
            finalPath.trim() + '" --user "root:hp" -o "' + rootPath + '\\data.csv"';
        } else {
          // cmd = 'curl -k "sftp://10.76.139.29:22' + finalPath.trim() + '" --user "root:hp" -o "' + rootPath + '/data.csv"';
          cmd = 'curl -k "sftp://192.168.1.159:22' + finalPath.trim() + '" --user "andrea:123" -o "' + rootPath + '/data.csv"';
        }
        // console.log(cmd);
        this.electron.childProcess.exec(cmd, (error, stdout, stderr) => {
          if (error) {
            console.error('exec error: ', stderr);
            return;
          } else {
            this.printPdf();
            this.scanDir();
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
    const historyPath = path.join(this.electron.remote.app.getAppPath(), 'history');
    const templateLists: any = [];
    this.electron.fs.readdirSync(historyPath).forEach((file) => {
      console.log(file);
      templateLists.push({name: file.toString(), pathFile: path.join(historyPath, file)});
    });
    console.log(templateLists);
    this.dataSource.data = templateLists;
  }

  public printPdf() {
    let pathFile;
    if (process.platform === 'win32') {
      pathFile = rootPath + '\\data.csv';
    } else {
      pathFile = rootPath + '/data.csv';
    }
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

