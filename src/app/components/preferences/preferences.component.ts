import {Component, OnInit, OnDestroy, OnChanges, SimpleChanges} from '@angular/core';
import {ElectronService} from '../../providers/electron.service';

import {LocalStorageService} from 'ngx-webstorage';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit, OnDestroy, OnChanges {

  constructor(private electron: ElectronService,
              public localStorage: LocalStorageService) {

  }

  ngOnInit() {

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
    console.log(event.target.value);
    this.localStorage.store('serverIp', event.target.value);
  }

  onchangeUsername(event: any) {
    console.log(event.target.value);
    this.localStorage.store('username', event.target.value);
  }

  onchangePassword(event: any) {
    console.log(event.target.value);
    this.localStorage.store('password', event.target.value);
  }

  automaticOpenChange() {
    this.localStorage.store('automaticOpenPDF', !this.localStorage.retrieve('automaticOpenPDF'));
  }
}

