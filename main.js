"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var windowStateKeeper = require("electron-window-state");
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
    var mainWindowState = windowStateKeeper({
        defaultWidth: 700,
        defaultHeight: 300
    });
    win = new electron_1.BrowserWindow({
        'x': mainWindowState.x,
        'y': mainWindowState.y,
        'width': mainWindowState.width,
        'height': mainWindowState.height,
        webPreferences: {
            nodeIntegration: true,
        },
        icon: __dirname + '/icona.png'
    });
    mainWindowState.manage(win);
    // win.setTitle((serve) ? 'Les - ' + app.getVersion() + ' DEV' : 'Les - ' + app.getVersion());
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
    // trigger autoupdate check
    autoUpdater.checkForUpdates();
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
function start() {
    var image = electron_1.nativeImage.createFromPath(path.join(__dirname, 'icona.png'));
    if (process.platform === 'win32') {
        // image = nativeImage.createFromPath(path.join(__dirname, '../icons/win/app.ico'));
    }
    else if (process.platform === 'darwin') {
        // image = nativeImage.createFromPath(path.join(__dirname, '../icons/mac/app.icns'));
    }
    else if (process.platform === 'linux') {
    }
    tray = new electron_1.Tray(image);
    var contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: 'Open', click: function () {
                win.show();
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
                        if (tray != null) {
                            tray.destroy();
                            tray = null;
                        }
                        electron_1.app.quit();
                    }
                });
            }
        },
    ]);
    tray.setToolTip(electron_1.app.getName());
    tray.setContextMenu(contextMenu);
    createWindow();
    win.hide();
}
try {
    electron_1.app.on('ready', function () {
        start();
    });
    electron_1.app.on('window-all-closed', function () {
    });
    electron_1.app.on('activate', function () {
        if (win === null) {
            createWindow();
        }
    });
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
        autoUpdater.checkForUpdatesAndNotify();
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
        autoUpdater.quitAndInstall();
    });
}
catch (e) {
}
//# sourceMappingURL=main.js.map