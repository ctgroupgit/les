"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
// import * as windowStateKeeper from 'electron-window-state';
var autoUpdater = require('electron-updater').autoUpdater;
var log = require('electron-log');
var win, serve;
var args = process.argv.slice(1);
serve = args.some(function (val) { return val === '--serve'; });
var tray = null;
// configure logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');
function createWindow() {
    win = new electron_1.BrowserWindow({
        'width': 700,
        'height': 300,
        webPreferences: {
            nodeIntegration: true,
        },
        icon: './icona.png'
    });
    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
        win.loadURL('http://localhost:4200');
    }
    else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, './build/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    if (serve) {
        win.webContents.openDevTools();
    }
    win.on('close', function (e) {
        e.preventDefault();
        win.hide();
    });
    win.on('show', function () {
        win.reload();
    });
    win.setMenu(null);
}
try {
    electron_1.app.on('ready', function () {
        var image = electron_1.nativeImage.createFromPath('./invio.py');
        tray = new electron_1.Tray(image);
        var contextMenu = electron_1.Menu.buildFromTemplate([
            {
                label: 'Open', click: function () {
                    win.show();
                }
            },
            {
                label: 'Hide Windows', click: function () {
                    win.hide();
                }
            },
            {
                label: 'Quit', click: function () {
                    var options = {
                        type: 'question',
                        buttons: ['Yes', 'No'],
                        defaultId: 1,
                        title: 'Question',
                        message: 'Do you want to do this?',
                        detail: 'It does not really matter',
                    };
                    electron_1.dialog.showMessageBox(null, options, function (response) {
                        if (response === 0) {
                            electron_1.app.quit();
                        }
                    });
                }
            },
        ]);
        tray.setToolTip(electron_1.app.getName());
        tray.setContextMenu(contextMenu);
        createWindow();
        autoUpdater.checkForUpdatesAndNotify();
    });
    electron_1.app.on('before-quit', function () {
        if (win) {
            win.removeAllListeners('close');
            tray.destroy();
            tray = null;
            win.close();
        }
    });
    electron_1.app.on('window-all-closed', function () {
    });
    // app.on('activate', () => {
    //   if (win === null) {
    //     createWindow();
    //   }
    // });
    //-------------------------------------------------------------------
    // Auto updates
    //-------------------------------------------------------------------
    var sendStatusToWindow_1 = function (text) {
        log.info(text);
        if (win) {
            win.webContents.send('message', text);
        }
    };
    autoUpdater.on('checking-for-update', function () {
        sendStatusToWindow_1('Checking for update...');
    });
    autoUpdater.on('update-available', function (info) {
        sendStatusToWindow_1('Update available.');
    });
    autoUpdater.on('update-not-available', function (info) {
        sendStatusToWindow_1('Update not available.');
    });
    autoUpdater.on('error', function (err) {
        sendStatusToWindow_1("Error in auto-updater: " + err.toString());
    });
    autoUpdater.on('download-progress', function (progressObj) {
        sendStatusToWindow_1("Download speed: " + progressObj.bytesPerSecond + " - Downloaded " + progressObj.percent + "% (" + progressObj.transferred + " + '/' + " + progressObj.total + " + )");
    });
    autoUpdater.on('update-downloaded', function (info) {
        sendStatusToWindow_1('Update downloaded; will install now');
        tray.destroy();
        tray = null;
        autoUpdater.quitAndInstall();
    });
}
catch (e) {
}
//# sourceMappingURL=main.js.map