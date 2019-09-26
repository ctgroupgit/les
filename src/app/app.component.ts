import {Component} from '@angular/core';
import {ElectronService} from './providers/electron.service';
import {TranslateService} from '@ngx-translate/core';
import {AppConfig} from '../environments/environment';
import {GlobalService} from './providers/global.service';
import {LoggerService} from './providers/logger.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  appVersion: string;
    selected;
  constructor(public electronService: ElectronService,
              private translate: TranslateService,
              private log: LoggerService,
              public  gb: GlobalService) {

    this.appVersion = this.electronService.remote.app.getVersion();
    translate.setDefaultLang('en');
    // console.log('AppConfig', AppConfig);
    // console.log(this.electronService.remote.app.getAppPath());

    // console.log(this.electronService.remote.app.getPath('appData'));

    if (electronService.isElectron()) {
      // console.log('Mode electron');
      // console.log('Electron ipcRenderer', electronService.ipcRenderer);
      // console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      // console.log('Mode web');
    }
  }

  public refresh() {
    this.electronService.remote.getCurrentWindow().reload();
  }

  public devTools() {
    this.electronService.remote.getCurrentWindow().webContents.toggleDevTools();
  }
}
