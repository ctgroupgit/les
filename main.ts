import {app, BrowserWindow, Tray, Menu, nativeImage, dialog} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as windowStateKeeper from 'electron-window-state';

const {autoUpdater} = require('electron-updater');
const log = require('electron-log');

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');
let tray = null;

// configure logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

function createWindow() {

  const mainWindowState = windowStateKeeper({
    defaultWidth: 700,
    defaultHeight: 300
  });

  win = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: './icona.png'
  });

  mainWindowState.manage(win);
  // win.setTitle((serve) ? 'Les - ' + app.getVersion() + ' DEV' : 'Les - ' + app.getVersion());

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, './build/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // trigger autoupdate check
  autoUpdater.checkForUpdates();

  if (serve) {
  win.webContents.openDevTools();
  }

  win.on('close', (e) => {

    e.preventDefault();
    // win.hide();
  });

  win.on('show', function () {
    win.reload();
  });

  win.setMenu(null);

}

function start() {
  const image = nativeImage.createFromPath(path.join(__dirname, 'icona.png'));
  if (process.platform === 'win32') {
    // image = nativeImage.createFromPath(path.join(__dirname, '../icons/win/app.ico'));
  } else if (process.platform === 'darwin') {
    // image = nativeImage.createFromPath(path.join(__dirname, '../icons/mac/app.icns'));
  } else if (process.platform === 'linux') {

  }
  tray = new Tray(image);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open', click() {
        win.show();
      }
    },
    {
      label: 'Quit', click() {
        const options = {
          type: 'question',
          buttons: ['Yes', 'No'],
          defaultId: 1,
          title: 'Question',
          message: 'Do you want to do this?',
          detail: 'It does not really matter',
        };
        dialog.showMessageBox(null, options, (response) => {
          if (response === 0) {
            if (tray != null) {
              tray.destroy();
              tray = null;
            }
            app.quit();
          }
        });
      }
    },

  ]);
  tray.setToolTip(app.getName());
  tray.setContextMenu(contextMenu);

  createWindow();
  // win.hide();
}

try {

  app.on('ready', () => {

    start();
  });

  app.on('window-all-closed', () => {

  });

  app.on('activate', () => {
    if (win === null) {
      createWindow();
    }
    autoUpdater.checkForUpdatesAndNotify()
  });

  //-------------------------------------------------------------------
// Auto updates
//-------------------------------------------------------------------
  const sendStatusToWindow = (text) => {
    log.info(text);
    if (win) {
      win.webContents.send('message', text);
    }
  };

  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
  });
  autoUpdater.on('update-available', info => {
    sendStatusToWindow('Update available.');
  });
  autoUpdater.on('update-not-available', info => {
    sendStatusToWindow('Update not available.');
  });
  autoUpdater.on('error', err => {
    sendStatusToWindow(`Error in auto-updater: ${err.toString()}`);
  });
  autoUpdater.on('download-progress', progressObj => {
    sendStatusToWindow(
      `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred} + '/' + ${progressObj.total} + )`
    );
  });
  autoUpdater.on('update-downloaded', info => {
    sendStatusToWindow('Update downloaded; will install now');
    autoUpdater.quitAndInstall();
  });


} catch (e) {

}
