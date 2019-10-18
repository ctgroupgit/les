import {Component, OnInit, OnDestroy, OnChanges, SimpleChanges} from '@angular/core';
import {ElectronService} from '../../providers/electron.service';
import {LocalStorageService} from 'ngx-webstorage';
import {MatTableDataSource} from '@angular/material';
import * as path from 'path';
import {SockService} from '../../providers/sock.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit, OnDestroy, OnChanges {

  public displayedColumns = ['name', 'pathFile'];
  public dataSource = new MatTableDataSource<string>();
  downloadPath;

  constructor(private electron: ElectronService,
              public localStorage: LocalStorageService,
              public sock: SockService) {
    this.downloadPath = path.join(this.electron.remote.app.getPath('appData'), this.electron.remote.app.getName(), 'downloadData');
  }

  public scanDir() {
    const templateLists: any = [];
    this.electron.fs.readdirSync(this.downloadPath).forEach((file) => {
      // console.log(file);
      templateLists.push({name: file.toString(), pathFile: path.join(this.downloadPath, file)});
    });
    // console.log(templateLists);
    this.dataSource.data = templateLists.sort(function(obj1, obj2) {
      return obj2.order - obj1.order;
    });
  }

  public downloadFile(filePath: string) {
    const destination = '';
      const options = {
        title: 'Save file ',
        buttonLabel: 'Save'
      };

    const fileDestination = this.electron.remote.dialog.showSaveDialog(this.electron.remote.getCurrentWindow(), options);
    if (fileDestination.length > 0) {
      this.electron.fs.writeFileSync(filePath['pathFile'], fileDestination);
    }
  }

  public uploadFile(filePath: string) {
      // this.sock.uploadFile('', '');
  }

  getCommandLine() {
    switch (process.platform) {
      case 'darwin' :
        return 'open ';
      case 'win32' :
          return 'explorer ';
      default :
        return 'xdg-open ';
    }
  }


  ngOnInit() {
    this.scanDir();
  }

  ngOnDestroy() {

  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  onSelectSaveFolder() {
    this.electron.remote.dialog.showOpenDialog(
      this.electron.remote.getCurrentWindow(), {properties: ['openDirectory']}, (path) => {
        this.localStorage.store('saveFolder', path);
      }
    );
  }

  onchangeIP(event: any) {
    // console.log(event.target.value);
    this.localStorage.store('serverIp', event.target.value);
  }

  onchangeUsername(event: any) {
    // console.log(event.target.value);
    this.localStorage.store('username', event.target.value);
  }

  onchangePassword(event: any) {
    // console.log(event.target.value);
    this.localStorage.store('password', event.target.value);
  }

  automaticOpenChange() {
    this.localStorage.store('debug', !this.localStorage.retrieve('debug'));
  }
}

