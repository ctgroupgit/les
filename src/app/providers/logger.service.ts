import {Injectable} from '@angular/core';

export abstract class Logger {
    table: any;
    info: any;
    warn: any;
    error: any;
}

@Injectable({
    providedIn: 'root'
})
export class LoggerService implements Logger {
    table: any;
    info: any;
    warn: any;
    error: any;
    invokeConsoleMethod(type: string, args?: any): void {}
}
