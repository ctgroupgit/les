import {Injectable} from '@angular/core';
import {ElectronService} from './electron.service';
import {LoggerService} from './logger.service';
import {noop, Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GlobalService {
    user = ['frausezerseher', 'nicolenaiel', 'michaelbatzler', 'klauskorte', 'nadinecordeiro'];
    printType = ['NORMAL', 'KOPIE', 'DUPLIKAT'];
    printTypeMultiple = false;

    constructor(private log: LoggerService, private electron: ElectronService) {
    }

    checkDocType(csvData = []): string {
        let type = '';
        console.log(this.printTypeMultiple);
        csvData.forEach((row) => {
            if (row[1].trim() === 'KOPIEN') {
                if (this.printTypeMultiple) {
                    type = row[14].toLocaleUpperCase();
                } else {
                    const buttonsReq = [];
                    buttonsReq.push(row[14]);
                    if ((row[15].indexOf('KOPIE') > 0 || row[15].indexOf('DUPLIKAT') > 0) && buttonsReq.indexOf(row[15]) === -1) {
                        buttonsReq.push(row[15]);
                    }
                    if ((row[16].indexOf('KOPIE') > 0 || row[16].indexOf('DUPLIKAT') > 0) && buttonsReq.indexOf(row[16]) === -1) {
                        buttonsReq.push(row[16]);
                    }
                    if ((row[17].indexOf('KOPIE') > 0 || row[17].indexOf('DUPLIKAT') > 0) && buttonsReq.indexOf(row[17]) === -1) {
                        buttonsReq.push(row[17]);
                    }
                    if ((row[18].indexOf('KOPIE') > 0 || row[18].indexOf('DUPLIKAT') > 0) && buttonsReq.indexOf(row[18]) === -1) {
                        buttonsReq.push(row[18]);
                    }
                    if (buttonsReq.length > 1) {
                        const options = {
                            buttons: buttonsReq,
                            message: 'Attention I found two types of documents. Which one do you want to print?'
                        };
                        const response = this.electron.remote.dialog.showMessageBox(options);
                        this.log.info('Documento Scelto:', response);
                        switch (response) {
                            case 4: {
                                type = row[18].toLocaleUpperCase();
                                break;
                            }
                            case 3: {
                                type = row[17].toLocaleUpperCase();
                                break;
                            }
                            case 2: {
                                type = row[16].toLocaleUpperCase();
                                break;
                            }
                            case 1: {
                                type = row[15].toLocaleUpperCase();
                                break;
                            }
                            case 0: {
                                type = row[14].toLocaleUpperCase();
                                break;
                            }
                            default: {
                                type = row[14].toLocaleUpperCase();
                                break;
                            }
                        }
                    } else {
                        type = row[14].toLocaleUpperCase();
                    }
                }
            }
        });

        return type;
    }

    genKontakt(row = []) {
        // this.log.info(row);
        let stop = false;
        let idx = 20;
        let posArray = -1;
        while (!stop) {
            posArray = this.containsAny(row[idx].trim(), this.user);
            if (posArray > -1) {
                // console.log('TROVATA POSIZIONE:', posArray);
                stop = true;
            } else {
                if (idx >= 24) {
                    stop = true;
                } else {
                    idx++;
                }
            }
        }
        switch (posArray) {
            case 0: {
                return ['Frau Sezer, Seher', 'seher.sezer@zzdrivetech.com', '0721/6205-36'];
            }
            case 1: {
                return ['Nicole Naiel', 'nicole.naiel@zzdrivetech.com', '0721/6205-37'];
            }
            case 2: {
                return ['Michael Batzler', 'michael.batzler@zzdrivetech.com', '0721/6205-72'];
            }
            case 3: {
                return ['Klaus Korte', 'klaus.korte@zzdrivetech.com', '0721/6205-51'];
            }
            case 4: {
                return ['Nadine Cordeiro', 'nadine.cordeiro@zzdrivetech.com', '0721/6205-35'];
            }
            default: {
                return ['ZZ Drive Tech GmbH', 'info@zzdrivetech.com', '0721/6205-0'];
            }
        }
    }

    containsAny(searchString, arrayDoveCercare = []) {
        // console.log('CERCO', searchString, 'IN', arrayDoveCercare);
        for (let i = 0; i !== arrayDoveCercare.length; i++) {
            const substring = arrayDoveCercare[i];
            if (searchString.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === substring) {
                return i;
            }
        }
        return -1;
    }

    deUmlaut(value) {
        value = value.toLocaleUpperCase();
        value = value.replace(/ä/g, 'ae');
        value = value.replace(/ö/g, 'oe');
        value = value.replace(/ü/g, 'ue');
        value = value.replace(/ß/g, 'ss');
        value = value.replace(/ /g, '');
        value = value.replace(/\./g, '');
        value = value.replace(/,/g, '');
        value = value.replace(/\(/g, '');
        value = value.replace(/\)/g, '');
        value = value.replace(/\\/g, '-');
        value = value.replace(/\//g, '-');
        return value;
    }

    getCommandLine() {
        switch (process.platform) {
            case 'linux' :
                return 'xdg-open ';
            case 'darwin' :
                return 'open ';
            case 'win32' :
                return 'explorer ';
            default :
                return ' ';
        }
    }

    normalizeChar(str: string, nrChar: number) {
        const tempStr: string[] = str.split(':');

        // console.log(str , tempStr);

        const s1 = tempStr[0] ? tempStr[0].replace('\t', '').trim() : '';
        const s2 = tempStr[1] ? tempStr[1].replace('\t', '').trim() : '';
        const s3 = tempStr[2] ? tempStr[2].replace('\t', '').trim() : '';

        return s1.concat(((tempStr.length > 1) ? ':' : '')) +
            ' '.repeat(nrChar - (s1.length > nrChar ? 0 : s1.length)) +
            s2 +
            ((s3.length > 0) ? ' ' + s3 : '');
    }

    trimText(text, length) {
        return text.length > length ? text.substring(0, length) + '.' : text;
    }

    currencyFormatDE(num) {
        if (num === '0,00') {
            return '0';
        }
        const tempNum = (
            parseFloat(num.replace(',', '.'))
                .toFixed(2)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')).toString();
        if (tempNum === 'NaN') {
            return  '0';
        }
        return tempNum;
    }

    StrToNumber(val: string, defaultVal: number = 0): string {
        // console.log('NUMERO TROVATO', val);
        let newVal = parseFloat(
            val.replace(',', '.')
                .replace('\n', '')
                .replace('\r', '')
        );
        if (isNaN(newVal)) {
            newVal = 0;
        }
        // console.log('NUMERO TROVATO', val, newVal);
        return newVal.toString().replace('.', ',');
    }

    showErrorDialog(title: string, message: string) {
        this.electron.remote.dialog.showErrorBox(title, message);
    }
}
