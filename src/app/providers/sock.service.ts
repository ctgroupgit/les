import {Injectable} from '@angular/core';
import {ElectronService} from './electron.service';
import {BoundEventAst} from '@angular/compiler';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class SockService {

  sock: any;
  dati = new BehaviorSubject<any>(null);

  constructor(
    private _electron: ElectronService
  ) {
    this.sock = this._electron.net.createServer(socket => {
      // socket.write('Welcome ' + socket.remoteAddress + '\n');
      socket.on('data', (data) => {
        this.dati.next(data);
        // // console.log(socket.remoteAddress + ' -> ' + data);
        // if (!_electron.remote.getCurrentWindow().isVisible()) {
        //   _electron.remote.getCurrentWindow().show();
        // }
        socket.end();
      });
    });
    this.sock.listen(8010, '0.0.0.0');
  }
}
