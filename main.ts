import {app, BrowserWindow, Tray, Menu, nativeImage, dialog} from 'electron';
import * as path from 'path';
import * as url from 'url';
// import * as windowStateKeeper from 'electron-window-state';

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
  win = new BrowserWindow({
    'width': 700,
    'height': 700,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: './icona.png'
  });

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

  if (serve) {
    win.webContents.openDevTools();
  }

  win.on('close', (e) => {
    e.preventDefault();
    win.hide();
  });

  win.on('show', function () {
    // win.reload();
  });

  win.setMenu(null);
}

try {

  app.on('ready', () => {
    const iconPath = path.join(app.getAppPath(), 'build/assets/icona.png');
    let image;
    if (serve) {
      image = nativeImage.createFromPath(iconPath);
    } else {
      image = nativeImage.createFromPath(iconPath);
    }
    tray = new Tray(image);
    // tray = new Tray(image);
    tray.setHighlightMode('always');
    tray.on('click', () => {
      if (win.isVisible()) {
        win.hide();
      } else {
        win.show();
      }
    });
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Windows', click() {
          win.show();
        }
      },
      {
        label: 'Hide Windows', click() {
          win.hide();
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
              app.quit();
            }
          });
        }
      },

    ]);

    tray.setToolTip(app.getName());
    tray.setContextMenu(contextMenu);

    createWindow();
    setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 60000);
  });

  app.on('before-quit', () => {

    if (win) {
      win.removeAllListeners('close');
      tray.destroy();
      tray = null;
      win.close();
    }

  });

  app.on('window-all-closed', () => {

  });

  // app.on('activate', () => {
  //   if (win === null) {
  //     createWindow();
  //   }
  // });

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
    tray.destroy();
    tray = null;
    autoUpdater.quitAndInstall();
  });


} catch (e) {

}
