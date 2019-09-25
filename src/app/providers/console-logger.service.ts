import {Injectable} from '@angular/core';
import {Logger} from './logger.service';
import {ElectronService} from './electron.service';

const noop = (): any => undefined;

@Injectable()
export class ConsoleLoggerService implements Logger {
    isDebugMode: boolean;

    constructor(private electron: ElectronService) {
        this.isDebugMode = this.electron.remote.getCurrentWindow().webContents.isDevToolsOpened();
    }

    get table() {
        if (this.isDebugMode) {
            return console.table.bind(console);
        } else {
            return noop;
        }
    }

    get info() {
        if (this.isDebugMode) {
            return console.log.bind(console);
        } else {
            return noop;
        }
    }

    get warn() {
        if (this.isDebugMode) {
            return console.warn.bind(console);
        } else {
            return noop;
        }
    }

    get error() {
        if (this.isDebugMode) {
            return console.error.bind(console);
        } else {
            return noop;
        }
    }

    invokeConsoleMethod(type: string, args?: any): void {
        const logFn: Function = (console)[type] || console.log || noop;
        logFn.apply(console, [args]);
    }
}
