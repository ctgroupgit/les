import {Injectable} from '@angular/core';
import {ipcRenderer, webFrame, remote} from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as net from 'net';


@Injectable()
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;
  net: typeof net;
  // shell: typeof shell;

  constructor() {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;
      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.net = window.require('net');
      // this.shell = window.require('shell');
    }
  }

  isElectron = () => {
    return window && window.process && window.process.type;
  }

}
