import {Injectable} from '@angular/core';
import * as jsPDF from 'jspdf';
import {ElectronService} from './electron.service';
import logoData from '../../logozz.json';
import {LocalStorageService} from 'ngx-webstorage';
import * as path from 'path';
import {RechnungService} from './rechnung.service';


@Injectable({
    providedIn: 'root'
})
export class PdfGenerationService {
    constructor(private electron: ElectronService,
                private ls: LocalStorageService,
                private rechnung: RechnungService) {
    }

    offsetX = 0;
    logozz: any = logoData;
    doc: any;
    CURRENT_BODY_LINE = 0;
    MAX_BODY_LINE: number;
    INTERLINEA = 3.5;
    BODY_OFFSET: number;
    COLUMN_HEADER = [];
    FUSS_OFFSET = 0;
    FINE_BODY = false;
    temp_nr_doc: string;
    tempOffset = 0;
    INTERROMPI = false;
    datiCliente: string;
    tipoDocumento: string;
    D1: string;
    D2: string;
    numeroDocumento: string;
    POS_SPACE = [];
    saluti = false;
    data = [];
    ultimeRighe = [];
    headerPrinted = false;
    isStart = true;
    tempDatoCheNonSoPercheStaQui = [];
    KOPF_TEXT = [];
    contattiCliente = [];
    contattoZZ = [];
    auftragsNr: string;
    recNr: string;
    auftragsDatum: string;
    angebotsNr: string;
    faxCliente: string;
    contattiStampati = false;
    ihreUstIdNr = [];
    unsereUstIdNr = [];
    ihreBestellNr = [];
    bestellDatum = [];
    ihrZeichen = [];
    // sachbearbeit = [];
    KOPF_RGAN = [];
    KOPF_ANS = [];
    pagina = 1;
    lieferNr = '';
    lieferDatum = '';
    memText = '';
    intestazione = '';
    currentDataLength = 0;
    KOPFTEXT_PRINTED = false;
    D3 = '';
    aufragNr2 = '';
    user = ['frausezerseher', 'nicolenaiel', 'michaelbatzler', 'klauskorte', 'nadinecordeiro'];


    static normalizeChar(str: string, nrChar: number) {
        // console.log(str);
        const newStr = str.replace(':', '').trimLeft().trimRight();
        return newStr + ' '.repeat(nrChar - newStr.length) + ': ';
    }

    trimText(text, length) {
        return text.length > length ? text.substring(0, length) + '.' : text;
    }

    currencyFormatDE(num) {
        return (
            parseFloat(num.replace(',', '.'))
                .toFixed(2)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
        );
    }

    public printOrder(ar: string[]) {
        this.data = ar;
        this.doc = new jsPDF({filters: ['ASCIIHexEncode']});

        this.CURRENT_BODY_LINE = 0;
        this.COLUMN_HEADER = [];
        this.datiCliente = '';
        this.tipoDocumento = '';
        this.D1 = '';
        this.D2 = '';
        this.numeroDocumento = '';
        this.FINE_BODY = false;
        this.BODY_OFFSET = 95;
        this.MAX_BODY_LINE = 47;
        this.POS_SPACE = [];
        this.saluti = false;
        this.headerPrinted = false;
        this.isStart = true;

        this.contattiCliente = [];
        this.contattoZZ = [];
        this.auftragsNr = '';
        this.auftragsDatum = '';
        this.angebotsNr = '';
        this.faxCliente = '';
        this.contattiStampati = false;
        this.unsereUstIdNr = [];
        this.ihreBestellNr = [];
        this.bestellDatum = [];
        this.ihrZeichen = [];
        // this.sachbearbeit = [];
        this.ihreUstIdNr = [];
        this.KOPF_RGAN = [];
        this.KOPF_ANS = [];
        this.KOPF_TEXT = [];
        this.ultimeRighe = [];
        this.pagina = 1;
        this.recNr = '';
        this.lieferNr = '';
        this.lieferDatum = '';
        this.memText = '';
        this.intestazione = '';
        this.KOPFTEXT_PRINTED = false;
        this.D3 = '';

        this.doc.setFontSize(8);
        this.doc.setFont('courier');

        this.currentDataLength = 0;
        let PosCount = '1';
        let tempPosZUSCHCount = 0;

        this.data.forEach((row) => {
            switch (row[1]) {
                case 'POS': {
                    if (row[2].toString() !== PosCount) {
                        this.POS_SPACE.push(tempPosZUSCHCount.toString());
                        tempPosZUSCHCount = 0;
                        PosCount = row[2];
                    }
                    break;
                }
                case 'POS_ZUSCH': {
                    tempPosZUSCHCount++;
                    break;
                }
            }
            this.currentDataLength++;
            if (this.currentDataLength === this.data.length) {
                this.POS_SPACE.push(tempPosZUSCHCount.toString());
                tempPosZUSCHCount = 0;
            }
        });

        let startLeRigheInMezzo = 0;
        let tempNetto;
        this.currentDataLength = 0;

        this.data.forEach((row) => {
            if (!this.INTERROMPI) {
                switch (row[1]) {
                    case 'CONTROL': {
                        break;
                    }
                    case 'KOPIEN': {
                        if (!this.isStart) {
                            this.newDocument();
                        }
                        // console.log(row[14], row[15], row[16]);
                        const buttonsReq = [];
                        buttonsReq.push(row[14]);
                        // console.log('FIND', buttonsReq.find(row[14]));
                        if ((row[15].indexOf('KOPIE') > 0 || row[15].indexOf('DUPLIKAT')  > 0) && buttonsReq.indexOf(row[15]) === -1) {
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
                            // console.log('Documento Scelto:', response);
                            switch (response) {
                                case 4: {
                                    this.tipoDocumento = row[18].toLocaleUpperCase();
                                    break;
                                }
                                case 3: {
                                    this.tipoDocumento = row[17].toLocaleUpperCase();
                                    break;
                                }
                                case 2: {
                                    this.tipoDocumento = row[16].toLocaleUpperCase();
                                    break;
                                }
                                case 1: {
                                    this.tipoDocumento = row[15].toLocaleUpperCase();
                                    break;
                                }
                                case 0: {
                                    this.tipoDocumento = row[14].toLocaleUpperCase();
                                    break;
                                }
                                default: {
                                    this.tipoDocumento = row[14].toLocaleUpperCase();
                                    break;
                                }

                            }
                            // console.log('SCELTA STAMPA', response);
                        } else {
                            this.tipoDocumento = row[14].toLocaleUpperCase();
                        }

                        this.tempDatoCheNonSoPercheStaQui = row[26]
                            .replace(/;/g, ',')
                            .replace(/ /g, '')
                            .replace(/\\/g, ',')
                            .replace(/\//g, ',')
                            .split(',');
                        this.isStart = false;
                        this.addFooter();
                        break;
                    }
                    case 'KOPF_ANS': {
                        for (let _i = 14; _i < 29; _i++) {
                            if (row[_i].length > 0) {
                                if (row[_i] !== 'VERSAND') {
                                    this.KOPF_ANS.push(row[_i]);
                                }
                            }
                        }

                        break;
                    }
                    case 'KOPF_RGAN': {
                        for (let _i = 14; _i < 28; _i++) {
                            if (row[_i].length > 0) {
                                this.KOPF_RGAN.push(row[_i]);
                            }
                        }

                        break;
                    }
                    case 'KOPF': {
                        this.datiCliente = row[21] + '\n' + row[22] + '\n' + row[23] + '\n' + row[24] + '\n' + row[25];
                        if (this.tipoDocumento === 'LIEFERSCHEIN' ||
                            this.tipoDocumento === 'LIEFERSCHEIN KOPIE' ||
                            this.tipoDocumento === 'DELIVERY NOTE' ||
                            this.tipoDocumento === 'AUFTRAGSBESTÄTIGUNG' ||
                            this.tipoDocumento === 'ORDER CONFIRMATION' ||
                            this.tipoDocumento === 'GUTSCHRIFT' ||
                            this.tipoDocumento === 'CREDIT NOTE') {
                            this.numeroDocumento = row[17] + '\n' + row[18];
                            this.D2 = row[19] + '\n' + row[20];
                            this.temp_nr_doc = row[18];
                            this.D1 = row[14] + '\n' + row[12];
                            this.auftragsNr = row[15] + '\n' + row[16];
                            this.D3 = row[15] + '\n' + row[16];
                        } else {
                            this.numeroDocumento = row[15] + '\n' + row[16];
                            this.temp_nr_doc = row[16];
                            this.D2 = row[17] + '\n' + row[18];
                            if (row[13].length > 0) {
                                this.D1 = row[14] + '\n' + row[13];
                            } else {
                                this.D1 = row[14] + '\n' + row[12];
                            }
                        }

                        if (this.tipoDocumento === 'RECHNUNG' || this.tipoDocumento === 'INVOICE') {
                            this.auftragsDatum = row[19] + '\n' + row[20];
                        }

                        break;
                    }
                    case 'KOPF_DATEN': {
                        let stop = false;
                        let idx = 20;
                        while (!stop) {
                            const posArray = this.containsAny(row[idx].trim());
                            if (posArray > -1 ) {
                                this.contattoZZ = this.genKontakt(posArray);
                                // console.log('TROVAT POS:', posArray);
                                stop = true;
                            } else {
                                if (idx >= 24) {
                                    stop = true;
                                } else {
                                    idx++;
                                }
                            }
                        }
                        // if (this.containsAny(row[20])) {
                        //     this.contattoZZ = this.genKontakt(row[20]);
                        // } else {
                        //     if (this.containsAny(row[21])) {
                        //         this.contattoZZ = this.genKontakt(row[21]);
                        //     } else {
                        //         if (this.containsAny(row[22])) {
                        //             this.contattoZZ = this.genKontakt(row[22]);
                        //         } else {
                        //             if (this.containsAny(row[23])) {
                        //                 this.contattoZZ = this.genKontakt(row[23]);
                        //             } else {
                        //                 if (this.containsAny(row[24])) {
                        //                     this.contattoZZ = this.genKontakt(row[24]);
                        //                 }
                        //             }
                        //         }
                        //     }
                        // }


                        if (row[28].length > 0 &&
                            this.tipoDocumento !== 'RECHNUNG' &&
                            this.tipoDocumento !== 'GUTSCHRIFT' &&
                            this.tipoDocumento !== 'INVOICE' &&
                            this.tipoDocumento !== 'CREDIT NOTE') {
                            this.auftragsNr = row[14] + '\n' + row[28];
                        }
                        if (this.tipoDocumento === 'BESTELLUNG') {
                            this.D2 = row[20] + '\n' + row[21];
                        }
                        this.ihreBestellNr.push(row[15]);
                        this.ihreBestellNr.push(row[16]);
                        this.ihreBestellNr.push(row[22]);
                        this.ihreBestellNr.push(row[23]);

                        if (this.tipoDocumento === 'RECHNUNG' || this.tipoDocumento === 'INVOICE') {
                            this.recNr = row[18] + '\n' + row[20];
                        } else {
                            if (this.tipoDocumento === 'LIEFERSCHEIN KOPIE' ||
                                this.tipoDocumento === 'LIEFERSCHEIN') {
                                this.aufragNr2 = row[18] + '\n';
                                this.aufragNr2 = row[20];
                            }
                        }

                        this.angebotsNr = row[14] + '\n' + row[15];
                        this.bestellDatum.push(row[17]);
                        this.bestellDatum.push(row[12]);
                        this.ihrZeichen.push('Your signs');
                        this.ihrZeichen.push(row[19]);
                        this.contattiCliente.push(row[16]);
                        if (row[17].length > 0) {
                            this.contattiCliente.push(row[17]);
                        }
                        if (row[18].length > 0) {
                            this.contattiCliente.push(row[18]);
                        }
                        if (this.tipoDocumento === 'LIEFERSCHEIN KOPIE' ||
                            this.tipoDocumento === 'LIEFERSCHEIN') {
                        }
                        // this.contattoZZ.push(row[22]);
                        // this.contattoZZ.push(row[23]);
                        // this.contattoZZ.push(row[24]);
                        break;
                    }
                    case 'KOPF_DATEN2': {
                        switch (this.tipoDocumento) {
                            case 'GUTSCHRIFT':
                            case 'CREDIT NOTE': {
                                this.angebotsNr = row[15] + '\n' + row[16];
                                this.auftragsNr = row[17] + '\n' + row[14];
                                this.lieferNr = row[15] + '\n' + row[16];
                                this.lieferDatum = row[18] + '\n' + row[12];
                                break;
                            }
                            case 'INVOICE': {
                                this.lieferNr = row[15] + '\n' + row[16];
                                this.lieferDatum = row[18] + '\n' + row[12];
                                break;
                            }
                            case 'PURCHASE ORDER CHANGE':
                            case 'PURCHASE ORDER': {
                                this.lieferNr = row[17] + '\n' + row[16];
                                this.lieferDatum = row[18] + '\n' + row[12];
                                this.numeroDocumento = row[15] + '\n' + row[16];
                                break;
                            }
                            case 'AUFTRAGSBESTÄTIGUNG':
                            case 'ORDER CONFIRMATION': {
                                this.lieferNr = row[17] + '\n' + row[16];
                                this.lieferDatum = row[18] + '\n' + row[12];
                                this.auftragsDatum = row[19] + '\n' + row[20];
                                break;
                            }
                            default: {
                                this.angebotsNr = row[15] + '\n' + row[14];
                                this.auftragsNr = row[16] + '\n' + row[17];
                                this.lieferNr = row[17] + '\n' + row[16];
                                this.lieferDatum = row[18] + '\n' + row[12];
                                break;
                            }
                        }
                        this.temp_nr_doc = row[14];

                        // if (this.tipoDocumento === 'RECHNUNG' ||
                        //     this.tipoDocumento === 'GUTSCHRIFT' ||
                        //     this.tipoDocumento === 'CREDIT NOTE' ||
                        //     this.tipoDocumento === 'INVOICE' ||
                        //     this.tipoDocumento === 'PURCHASE ORDER CHANGE' ||
                        //     this.tipoDocumento === 'PURCHASE ORDER'
                        // ) {
                        //     if (this.tipoDocumento !== 'INVOICE') {
                        //         if (this.tipoDocumento === 'GUTSCHRIFT' ||
                        //             this.tipoDocumento === 'CREDIT NOTE' ) {
                        //             this.angebotsNr = row[15] + '\n' + row[16];
                        //             this.auftragsNr = row[17] + '\n' + row[14];
                        //         } else {
                        //             this.angebotsNr = row[15] + '\n' + row[14];
                        //             this.auftragsNr = row[15] + '\n' + row[14];
                        //         }
                        //         this.lieferNr = row[17] + '\n' + row[16];
                        //         this.lieferDatum = row[18] + '\n' + row[12];
                        //     } else {
                        //         this.lieferNr = row[15] + '\n' + row[16];
                        //     }
                        //
                        //
                        //     this.temp_nr_doc = row[14];
                        //     if (this.tipoDocumento === 'PURCHASE ORDER CHANGE' ||
                        //         this.tipoDocumento === 'PURCHASE ORDER') {
                        //         this.numeroDocumento = row[15] + '\n' + row[16];
                        //     }
                        //
                        // } else if (this.tipoDocumento === 'AUFTRAGSBESTÄTIGUNG' || this.tipoDocumento === 'ORDER CONFIRMATION') {
                        //     this.auftragsDatum = row[19] + '\n' + row[20];
                        // }

                        break;
                    }
                    case 'KOPF_POSUEB': {

                        this.COLUMN_HEADER.push(row[14]);
                        this.COLUMN_HEADER.push(row[15]);
                        this.COLUMN_HEADER.push(row[16]);
                        this.COLUMN_HEADER.push(row[17]);
                        this.COLUMN_HEADER.push(row[18]);
                        this.COLUMN_HEADER.push(row[19]);
                        this.COLUMN_HEADER.push(row[20]);
                        this.COLUMN_HEADER.push(row[21]);
                        this.COLUMN_HEADER.push(row[22]);
                        this.ultimeRighe.push(row[23]);

                        if (row[13].length > 0) {
                            this.auftragsDatum = row[20] + '\n' + row[13];
                        }
                        break;
                    }
                    case 'KOPF_TEXTF': {
                        this.KOPF_TEXT.push(row[14].substring(1, row[14].length));
                        break;
                    }
                    case 'KOPF_TEXTK': {
                        this.KOPF_TEXT.push(row[14].substring(1, row[14].length));
                        break;
                    }
                    case 'KOPF_TEXTA': {
                        if (row[2] === '1') {
                            this.KOPF_TEXT.push('');
                        }
                        this.KOPF_TEXT.push(row[14].substring(1, row[14].length));
                        break;
                    }
                    case 'KONTAKT': {

                        if (row[24].length > 0) {
                            this.contattiCliente.push(row[24]);
                        }
                        if (row[25].length > 0) {
                            this.contattiCliente.push(row[25]);
                        }
                        this.faxCliente = 'Fax-Nr.: ' + row[24];
                        break;
                    }
                    case 'KOPF_USTID': {
                        this.ihreUstIdNr.push(row[14], row[15]);
                        this.unsereUstIdNr.push(row[16]);
                        this.unsereUstIdNr.push(row[17]);
                        break;
                    }
                    case 'POS': {
                        if (!this.KOPFTEXT_PRINTED) {
                            this.addHeader();
                            this.KOPF_TEXT.forEach(value => {
                                this.doc.setFontSize(10);
                                this.doc.text(value, this.offsetX + 10, this.BODY_OFFSET);
                                this.addNewLine();
                            });
                            this.KOPFTEXT_PRINTED = true;
                            this.addNewLine();
                        }
                        if (this.tipoDocumento === 'AUFTRAGSBESTÄTIGUNG' || this.tipoDocumento === 'ORDER CONFIRMATION') {
                            tempNetto = row[7];
                        } else {
                            tempNetto = row[6];
                        }
                        if ((this.tipoDocumento === 'AUFTRAGSBESTÄTIGUNG' ||
                            this.tipoDocumento === 'ORDER CONFIRMATION') && row[2] !== '1' && tempNetto.length > 0) {
                            this.doc.text('netto  ' + tempNetto + ' kg', this.offsetX + 25, this.BODY_OFFSET);
                            this.addNewLine();
                        }
                        startLeRigheInMezzo = 0;
                        if (row[2] === '1') {
                            this.addTableHeader();
                        }
                        this.doc.setFontSize(8);
                        this.doc.text(row[2], this.offsetX + 10, this.BODY_OFFSET);
                        this.doc.setFontStyle('bold');
                        if (row[15].length > 0) {
                            this.doc.text(row[14] + ' ' + row[15], this.offsetX + 25, this.BODY_OFFSET);
                            this.addNewLine();
                        }
                        this.doc.text(row[16], this.offsetX + 25, this.BODY_OFFSET);
                        this.doc.setFontStyle('normal');
                        const tempQta = row[3].split('');
                        let qta = '';
                        tempQta.forEach((char, index) => {
                            if (char === ',') {
                                if ((Number(tempQta[index + 1]) > 0) && index <= tempQta.length) {
                                    qta += char;
                                }
                            } else {
                                if (index <= tempQta.indexOf(',')) {
                                    qta += char;
                                } else {
                                    if ((Number(tempQta[index]) > 0)) {
                                        qta += char;
                                    }
                                }
                            }
                        });

                        this.doc.text(qta, this.offsetX + 115, this.BODY_OFFSET);

                        if (this.tipoDocumento === 'LIEFERSCHEIN KOPIE') {
                            this.doc.text(row[4].substring(0, row[4].indexOf(',', 0)), this.offsetX + 130, this.BODY_OFFSET);
                        } else {
                            this.doc.text(row[19], this.offsetX + 130, this.BODY_OFFSET);
                        }

                        if (this.tipoDocumento !== 'LIEFERSCHEIN KOPIE') {
                            if (row[4] !== '') {
                                this.doc.text(this.currencyFormatDE(row[4]), this.offsetX + 145, this.BODY_OFFSET);
                            }
                        } else {
                            if (row[5] !== '') {
                                this.doc.text(this.currencyFormatDE(row[5]), this.offsetX + 145, this.BODY_OFFSET);
                            }
                        }

                        if (this.tipoDocumento === 'ANFRAGE') {
                            if (row[28].length > 0) {
                                this.doc.text(row[28], this.offsetX + 145, this.BODY_OFFSET);
                            }
                        }

                        if (this.tipoDocumento !== 'LIEFERSCHEIN KOPIE') {
                            if (row[9].indexOf(',', 0) > 0) {
                                this.doc.text(row[9].substring(0, row[9].indexOf(',', 0)), this.offsetX + 165, this.BODY_OFFSET);
                            } else {
                                this.doc.text(row[9], this.offsetX + 165, this.BODY_OFFSET);
                            }
                        } else {
                            this.doc.text(row[19], this.offsetX + 165, this.BODY_OFFSET);
                        }

                        if (this.tipoDocumento !== 'DELIVERY NOTE' && this.tipoDocumento !== 'LIEFERSCHEIN KOPIE') {
                            if (row[5] !== '' && Number(row[5]) !== 0) {
                                this.doc.text(this.currencyFormatDE(row[5]), this.offsetX + 200, this.BODY_OFFSET, {align: 'right'});
                            } else {
                                this.doc.text(this.currencyFormatDE(row[6]), this.offsetX + 200, this.BODY_OFFSET, {align: 'right'});
                            }
                        }

                        this.addNewLine();
                        this.doc.text(row[17], this.offsetX + 25, this.BODY_OFFSET);
                        this.addNewLine();
                        this.doc.text(row[18], this.offsetX + 25, this.BODY_OFFSET);
                        this.addNewLine();
                        const tempPonNumber = Number(row[2]) - 1;
                        if (this.POS_SPACE[tempPonNumber] > 0) {
                            startLeRigheInMezzo = this.BODY_OFFSET;
                            this.addNewLine(this.POS_SPACE[tempPonNumber]);
                        }
                        if (row[23].length > 0 && row[22].length > 0) {
                            this.doc.setFontStyle('bold');
                            this.doc.text(PdfGenerationService.normalizeChar(row[22], 25) +
                                row[23], this.offsetX + 25, this.BODY_OFFSET);
                        }
                        if (row[13].length > 0 && row[21].length > 0 && this.tipoDocumento !== 'DELIVERY NOTE') {
                            this.doc.setFontStyle('bold');
                            this.doc.text(row[21].replace(/\s/g, '') + ' ' +
                                row[13], this.offsetX + 130, this.BODY_OFFSET);
                        } else if (row[13].length > 0 && row[21].length > 0 && this.tipoDocumento === 'DELIVERY NOTE') {
                            this.doc.setFontStyle('bold');
                            this.doc.text('Delivery Date ' +
                                row[13], this.offsetX + 130, this.BODY_OFFSET);
                        }
                        if (tempNetto !== '' && this.tipoDocumento === 'BESTELLUNG') {
                            this.doc.setFontStyle('normal');
                            this.doc.text('netto', this.offsetX + 165, this.BODY_OFFSET);
                            this.doc.text(this.currencyFormatDE(tempNetto), this.offsetX + 200, this.BODY_OFFSET, {align: 'right'});
                        }
                        if (this.tipoDocumento === 'AUFTRAGSBESTÄTIGUNG' || this.tipoDocumento === 'ORDER CONFIRMATION') {
                            this.doc.setFontStyle('bold');
                            this.doc.text(row[20] + ' ' + row[12], this.offsetX + 165, this.BODY_OFFSET);
                            this.doc.setFontStyle('normal');
                        }
                        this.doc.setFontStyle('normal');
                        this.addNewLine();
                        break;
                    }
                    case 'POS_RB': {
                        // console.log('POS_RB');
                        this.doc.text(row[14], this.offsetX + 165, this.BODY_OFFSET);
                        this.doc.text(row[15] + ' ' + this.currencyFormatDE(row[3]),
                            this.offsetX + 200, this.BODY_OFFSET, {align: 'right'});
                        this.addNewLine();
                        break;
                    }
                    case 'POS2': {
                        this.doc.setFontStyle('bold');
                        if (row[19].length > 0) {
                            this.doc.text(PdfGenerationService.normalizeChar(row[18], 25) + row[19],
                                this.offsetX + 25, this.BODY_OFFSET);
                            this.addNewLine();
                        }
                        if (row[17].length > 0) {
                            this.doc.text(PdfGenerationService.normalizeChar(row[16], 25) + row[17],
                                this.offsetX + 25, this.BODY_OFFSET);
                            this.addNewLine();
                        }
                        if (row[21].length > 0) {
                            this.doc.text(PdfGenerationService.normalizeChar(row[20], 25) + row[21],
                                this.offsetX + 25, this.BODY_OFFSET);
                            this.addNewLine();
                        }
                        if (row[23].length > 0) {
                            this.doc.text(PdfGenerationService.normalizeChar(row[22], 25) + row[23],
                                this.offsetX + 25, this.BODY_OFFSET);
                            this.addNewLine();
                        }
                        if (row[25].length > 0) {
                            this.doc.text(PdfGenerationService.normalizeChar(row[24], 25) + row[25],
                                this.offsetX + 25, this.BODY_OFFSET);
                            this.addNewLine();
                        }
                        this.doc.setFontStyle('normal');
                        break;
                    }
                    case 'POS 3': {
                        this.doc.setFontStyle('bold');
                        const itemCount = 2;
                        for (let _i = 0; _i < itemCount; _i++) {
                            if (row[16 + (_i * 2) + 1].length > 0) {
                                this.doc.text(PdfGenerationService.normalizeChar(row[16 + (_i * 2)], 25) + row[16 + (_i * 2) + 1],
                                    this.offsetX + 25, this.BODY_OFFSET);
                                this.addNewLine();
                            }
                        }
                        this.doc.setFontStyle('normal');
                        break;
                    }
                    case 'POS_TEXTA': {
                        this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 25, this.BODY_OFFSET);
                        this.addNewLine();
                        break;
                    }
                    case 'POS_TEXTP': {
                        this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 25, this.BODY_OFFSET);
                        this.addNewLine();
                        break;
                    }
                    case 'POS_ZUSCH': {
                        this.doc.setFontStyle('normal');
                        if (row[3] !== '' && row[14] !== '') {
                            this.doc.text(row[14], this.offsetX + 130, startLeRigheInMezzo);
                            // this.doc.text(this.currencyFormatDE(row[3]), this.offsetX + 145, startLeRigheInMezzo, {align: 'right'});
                        }
                        if (row[4] !== '' && row[15] !== '') {
                            this.doc.text(row[15], this.offsetX + 165, startLeRigheInMezzo);
                            this.doc.text(this.currencyFormatDE(row[4]), this.offsetX + 200, startLeRigheInMezzo, {align: 'right'});
                        }
                        startLeRigheInMezzo += this.INTERLINEA;
                        break;
                    }
                    case 'FUSS_WERTE': {
                        this.addNewLine();
                        if (!this.FINE_BODY) {
                            // this.newPage();
                            this.BODY_OFFSET += this.INTERLINEA;
                            this.CURRENT_BODY_LINE++;
                            this.doc.line(10, this.BODY_OFFSET - this.INTERLINEA, 200, this.BODY_OFFSET - this.INTERLINEA);
                            this.doc.line(10, this.BODY_OFFSET + 2, 200, this.BODY_OFFSET + 2);
                        }
                        this.FINE_BODY = true;
                        this.doc.setFontSize(10);
                        this.doc.setFontStyle('bold');
                        const datoUno = row[15];
                        const datoDue = this.currencyFormatDE(row[4]);
                        this.doc.text(datoUno, this.offsetX + this.offsetX + 120, this.BODY_OFFSET);
                        if (row[16] !== '') {
                            this.doc.text(row[3] + row[16], this.offsetX + 170, this.BODY_OFFSET, {align: 'right'});
                        }
                        this.doc.text(datoDue, this.offsetX + 200, this.BODY_OFFSET, {align: 'right'});
                        this.addNewLine(2);
                        break;
                    }
                    case 'FUSS_PRE': {
                        // console.log('INTERPRETO', 'FUSS_PRE');
                        if (row[15] !== this.memText) {
                            this.intestazione = row[15];
                            this.memText = row[15];
                        } else {
                            this.intestazione = '';
                        }
                        this.doc.setFontStyle('normal');
                        this.doc.setFontSize(10);
                        this.doc.text(
                            PdfGenerationService.normalizeChar(this.intestazione, 25) +
                            String(row[14]).trim(), this.offsetX + 10, this.BODY_OFFSET);
                        this.addNewLine();
                        break;
                    }
                    case 'FUSS_LIEFD': {
                        this.doc.setFontStyle('normal');
                        this.doc.setFontSize(10);
                        this.doc.text(String(row[14]).trim().substring(1, row[14].length), this.offsetX + 10, this.BODY_OFFSET);
                        this.addNewLine();
                        break;
                    }
                    case 'FUSS_LIEFB': {
                        if (row[15] !== this.memText) {
                            this.intestazione = row[15];
                            this.memText = row[15];
                        } else {
                            this.intestazione = '';
                        }
                        this.doc.setFontStyle('normal');
                        this.doc.setFontSize(10);
                        this.doc.text(
                            PdfGenerationService.normalizeChar(this.intestazione, 25) +
                            String(row[14]).trim(), this.offsetX + 10, this.BODY_OFFSET);
                        this.addNewLine();
                        break;
                    }
                    case 'FUSS_PACK': {
                        if (row[15] !== this.memText) {
                            this.intestazione = row[15];
                            this.memText = row[15];
                        } else {
                            this.intestazione = '';
                        }
                        this.doc.setFontStyle('normal');
                        this.doc.setFontSize(10);
                        this.doc.text(
                            PdfGenerationService.normalizeChar(this.intestazione, 25) +
                            String(row[14]).trim() + ' ' + String(row[16]).trim() + ' ' +
                            String(row[17]).trim(), this.offsetX + 10, this.BODY_OFFSET);
                        this.addNewLine();
                        break;
                    }
                    case 'FUSS_GEW': {
                        if (row[15] !== this.memText) {
                            this.intestazione = row[15];
                            this.memText = row[15];
                        } else {
                            this.intestazione = '';
                        }
                        this.doc.setFontStyle('normal');
                        this.doc.setFontSize(10);
                        this.doc.text(
                            PdfGenerationService.normalizeChar(this.intestazione, 25) +
                            String(row[14]).trim() + ' ' + String(row[16]).trim() + ' ' +
                            String(row[3]).trim() + ' Kg', this.offsetX + 10, this.BODY_OFFSET);
                        this.addNewLine();
                        break;
                    }
                    case 'FUSS_ZAHLB': {
                        // console.log('INTERPRETO', 'FUSS_ZAHLB');
                        if (row[15] !== this.memText) {
                            this.intestazione = row[15];
                            this.memText = row[15];
                        } else {
                            this.intestazione = '';
                        }
                        this.doc.setFontStyle('normal');
                        this.doc.setFontSize(10);
                        this.doc.text(
                            PdfGenerationService.normalizeChar(this.intestazione, 25) +
                            String(row[14]).trim(), this.offsetX + 10, this.BODY_OFFSET);
                        this.addNewLine();
                        break;
                    }
                    case 'FUSS_ZAHLA': {
                        // console.log('INTERPRETO', 'FUSS_ZAHLA');
                        if (row[15] !== this.memText) {
                            this.intestazione = row[15];
                            this.memText = row[15];
                        } else {
                            this.intestazione = '';
                        }
                        this.doc.setFontStyle('normal');
                        this.doc.setFontSize(10);
                        this.doc.text(
                            PdfGenerationService.normalizeChar(this.intestazione, 25) +
                            String(row[14]).trim(), this.offsetX + 10, this.BODY_OFFSET);
                        this.addNewLine();
                        break;
                    }
                    case 'FUSS_PRES2': {
                        this.doc.setFontStyle('normal');
                        this.doc.setFontSize(10);
                        this.doc.text(String(row[14]).trim().substring(1, row[14].length), this.offsetX + 10, this.BODY_OFFSET);
                        this.addNewLine();
                        break;
                    }
                    case 'FUSS_VART': {
                        this.doc.setFont('courier');
                        if (row[15] !== this.memText) {
                            this.intestazione = row[15];
                            this.memText = row[15];
                        } else {
                            this.intestazione = '';
                        }
                        this.doc.setFontStyle('normal');
                        this.doc.setFontSize(10);
                        this.doc.text(
                            PdfGenerationService.normalizeChar(this.intestazione, 25) +
                            String(row[14]).trim(), this.offsetX + 10, this.BODY_OFFSET);
                        this.addNewLine();
                        break;
                    }
                    case 'FUSS_TEXTF': {
                        if (!this.saluti) {
                            this.addNewLine();
                            this.saluti = true;
                        }
                        this.doc.setFontStyle('normal');
                        this.doc.setFontSize(10);
                        this.doc.text(String(row[14]).trim().substring(1, row[14].length), this.offsetX + 10, this.BODY_OFFSET);
                        this.addNewLine();
                        break;
                    }
                    default: {
                        break;
                    }
                }
                this.currentDataLength++;
                if (this.currentDataLength === this.data.length) {
                    this.doc.setFontStyle('normal');
                    this.doc.setFontSize(10);
                    this.addNewLine(3);
                    this.doc.text(this.ultimeRighe, this.offsetX + 10, this.BODY_OFFSET);
                }
            }
        });
        this.printPreviewPDF(this.doc.output(), this.tipoDocumento + '_' + this.temp_nr_doc);
    }

    addNewLine(numeroLinee: number = 1) {
        for (let _i = 0; _i < numeroLinee; _i++) {
            this.BODY_OFFSET += this.INTERLINEA;
            this.CURRENT_BODY_LINE++;
            if (this.CURRENT_BODY_LINE >= this.MAX_BODY_LINE) {
                if (this.currentDataLength < this.data.length + this.ultimeRighe.length - 1) {
                    this.newPage();
                    if (this.CURRENT_BODY_LINE === 0 && !this.FINE_BODY) {
                        this.addTableHeader();
                    }
                }
            }
        }
    }

    newPage() {
        this.doc.addPage();
        this.headerPrinted = false;
        this.pagina++;
        this.addHeader();
        this.addFooter();
        this.CURRENT_BODY_LINE = 0;
        this.BODY_OFFSET = 95;
        this.MAX_BODY_LINE = 46;
    }

    newDocument() {
        const openAuto = (this.ls.retrieve('automaticOpenPDF') === null ||
            this.ls.retrieve('automaticOpenPDF') === '' ||
            this.ls.retrieve('automaticOpenPDF') === 'undefined') ? true : this.ls.retrieve('automaticOpenPDF');
        if (openAuto) {
            this.printPreviewPDF(this.doc.output(), this.tipoDocumento + '_' + this.temp_nr_doc);
        } else {
            this.doc.save();
        }
        this.doc = new jsPDF({filters: ['ASCIIHexEncode']});
        this.doc.setFont('courier');
        this.addFooter();
        this.temp_nr_doc = '';
        this.CURRENT_BODY_LINE = 0;
        this.COLUMN_HEADER = [];
        this.datiCliente = '';
        this.tipoDocumento = '';
        this.D1 = '';
        this.D2 = '';
        this.numeroDocumento = '';
        this.FINE_BODY = false;
        this.BODY_OFFSET = 95;
        this.MAX_BODY_LINE = 47;
        this.POS_SPACE = [];
        this.saluti = false;
        this.tempDatoCheNonSoPercheStaQui = [];
        this.headerPrinted = false;
        this.contattiCliente = [];
        this.contattoZZ = [];
        this.auftragsNr = '';
        this.auftragsDatum = '';
        this.angebotsNr = '';
        this.faxCliente = '';
        this.contattiStampati = false;
        this.unsereUstIdNr = [];
        this.ihreBestellNr = [];
        this.bestellDatum = [];
        this.ihrZeichen = [];
        this.ihreUstIdNr = [];
        this.KOPF_TEXT = [];
        this.ultimeRighe = [];
        this.KOPF_RGAN = [];
        this.KOPF_ANS = [];
        this.pagina = 1;
        this.recNr = '';
        this.lieferNr = '';
        this.lieferDatum = '';
        this.memText = '';
        this.intestazione = '';
        this.KOPFTEXT_PRINTED = false;
        this.D3 = '';
    }

    addTableHeader() {
        const kk = (this.tipoDocumento === 'LIEFERSCHEIN KOPIE');
        this.doc.setFontStyle('bold');
        this.doc.setFontSize(7);
        if (this.COLUMN_HEADER.length > 0) {
            this.doc.line(10, this.BODY_OFFSET + 2, 200, this.BODY_OFFSET + 2);
            this.doc.line(10, this.BODY_OFFSET - 4, 200, this.BODY_OFFSET - 4);

            if (this.COLUMN_HEADER[0] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
                this.doc.text(this.trimText(this.COLUMN_HEADER[0], 5), this.offsetX + 10, this.BODY_OFFSET);
            }
            this.doc.setFontSize(8);
            if (this.COLUMN_HEADER[1] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
                this.doc.text(this.trimText(this.COLUMN_HEADER[1], 40), this.offsetX + 25, this.BODY_OFFSET);
            }
            if (this.COLUMN_HEADER[2] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
                this.doc.text(this.trimText(this.COLUMN_HEADER[2], 5), this.offsetX + 115, this.BODY_OFFSET);
            }
            if (this.COLUMN_HEADER[3] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
                this.doc.text(this.trimText(this.COLUMN_HEADER[3], 5), this.offsetX + 130, this.BODY_OFFSET);
            }
            if (this.COLUMN_HEADER[4] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
                this.doc.text(this.trimText(this.COLUMN_HEADER[4], 12), this.offsetX + 145, this.BODY_OFFSET);
            }
            if (this.COLUMN_HEADER[5] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
                this.doc.text(this.trimText(this.COLUMN_HEADER[5], 5), this.offsetX + 165, this.BODY_OFFSET);
            }
            if (!kk) {
                if (this.COLUMN_HEADER[6] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
                    this.doc.text(this.trimText(this.COLUMN_HEADER[6], 5), this.offsetX + 180, this.BODY_OFFSET);
                }
                if (this.COLUMN_HEADER[7] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
                    this.doc.text(this.trimText(this.COLUMN_HEADER[7], 5), this.offsetX + 192, this.BODY_OFFSET);
                }
            }
        }
        this.doc.setFontStyle('normal');
        this.addNewLine(2);
    }

    addFooter() {
        this.doc.setFontStyle('normal');
        this.doc.setFontSize(7);
        const image = 'data:image/png;base64,' + this.logozz[0]['logoct'];
        this.doc.addImage(image, 'JPEG', 10, 269, 23, 26);
        // footer
        // if (this.tipoDocumento === 'BESTELLUNG' || this.tipoDocumento === 'ANFRAGE') {
        this.doc.text('ME = Mengeneinheit: ST = Stück; g = Gramm; kg = Kilogramm    PE = Preiseinheit: 0=1 Stück; 1=pro 10; ' +
            '2=pro 100; 3=pro 1000', this.offsetX + 10, 266);
        // }
        this.doc.line(8, 268, 203, 268);
        this.doc.setFontStyle('normal');
        this.doc.setFontSize(7);
        this.doc.text('build(' + this.electron.remote.app.getVersion() + ')', 120, 289);
        this.doc.text('Made by CTGROUP IT Department', 120, 293);
        this.doc.setFontStyle('bold');
        this.doc.setFontSize(9);
        this.doc.text('Page ' + this.pagina, 190, 293);
        this.doc.setFontStyle('normal');
        this.doc.setFontSize(7);

        this.doc.text('ZZ Drive Tech GmbH', 45, 272);
        this.doc.text('An der Tagweide 12', 45, 275);
        this.doc.text('76139 Karlsruhe', 45, 278);
        this.doc.text('Sitz der Gesellschaft Karlsruhe', 45, 281);
        this.doc.text('Registergericht: AG Mannheim HRB 721742', 45, 284);
        this.doc.text('Geschäftsführer: Pasqualino Di Matteo', 45, 287);
        this.doc.text('Ust-IdNr.: DE815609203', 45, 290);
        this.doc.text('St.-Nr.: 35009/07754', 45, 293);
        this.doc.text('Tel. +49 (0)721/6205-0', 120, 272);
        this.doc.text('Fax +49 (0)721/6205-10', 120, 275);
        this.doc.text('info@zzdrivetech.com', 120, 278);
        this.doc.text('www.zzdrivetech.com', 120, 281);

        this.doc.text('UniCredit Bank AG', 160, 272);
        this.doc.text('IBAN: DE81660202860022616510', 160, 275);
        this.doc.text('BIC: HYVEDEMM475', 160, 278);
    }

    addHeader() {
        // console.log('CONTATTO ZZ', this.contattoZZ);

        const leftMargin = 8;
        const topMargin = 10;
        if (!this.headerPrinted) {
            this.headerPrinted = true;
            const image = 'data:image/png;base64,' + this.logozz[0]['logozz'];
            this.doc.addImage(image, 'JPEG', 100, 1, 100, 54);
            // this.doc.setLineDash([3, 3, 3, 3], 3);
            // this.doc.setLineWidth(0.1);
            // this.doc.line(10, 35, 10, 80);
            // this.doc.setLineDash(0);
            this.doc.setLineWidth(0.2);
            // if (this.pagina === 1) {
            this.doc.setFontSize(7);
            this.doc.text('ZZ-DriveTech GmbH, An der Tagweide 12, 76139 Karlsruhe', this.offsetX + 10 + leftMargin, topMargin + 35);
            // }
            this.doc.setFontStyle('normal');
            this.doc.setFontSize(10);
            if (this.tipoDocumento !== 'BESTELLUNG' &&
                this.tipoDocumento !== 'AUFTRAGSBESTÄTIGUNG' &&
                this.tipoDocumento !== 'RECHNUNG' &&
                this.tipoDocumento !== 'INVOICE' &&
                this.tipoDocumento !== 'ORDER CONFIRMATION' &&
                this.tipoDocumento !== 'GUTSCHRIFT' &&
                this.tipoDocumento !== 'CREDIT NOTE' &&
                this.tipoDocumento !== 'DELIVERY NOTE') {
                this.doc.text(this.faxCliente, this.offsetX + leftMargin + 10, topMargin + 40);
            }
            this.doc.text(this.datiCliente, this.offsetX + leftMargin + 10, topMargin + 45);
            this.doc.setFontSize(15);
            this.doc.setFontStyle('bold');
            this.doc.text(this.tipoDocumento, this.offsetX + 10, 90);
            this.doc.setFontSize(10);
            this.doc.text(this.D1.substring(0, this.D1.indexOf('\n')), this.offsetX + 170, 60);
            this.doc.setFontStyle('normal');
            this.doc.text(this.D1.substring(this.D1.indexOf('\n'),
                this.D1.length), this.offsetX + 170, 60);
            this.doc.setFontStyle('bold');
            this.doc.text(this.D2.substring(0, this.D2.indexOf('\n')), this.offsetX + 170, 70);
            this.doc.setFontStyle('normal');
            this.doc.text(this.D2.substring(this.D2.indexOf('\n'), this.D2.length), this.offsetX + 170, 70);
            this.doc.setFontStyle('bold');
            if (this.tipoDocumento === 'GUTSCHRIFT') {
                this.doc.text(this.D3.substring(0, this.D3.indexOf('\n')), this.offsetX + 170, 80);
            } else {
                this.doc.text(this.numeroDocumento.substring(0, this.numeroDocumento.indexOf('\n')), this.offsetX + 170, 80);
            }

            if (this.tipoDocumento === 'BESTELLUNG' || this.tipoDocumento === 'ANFRAGE') {
                this.doc.setFontSize(12);
            } else {
                this.doc.setFontStyle('normal');
            }
            if (this.tipoDocumento !== 'LIEFERSCHEIN KOPIE') {
                this.doc.text(this.numeroDocumento.substring(this.numeroDocumento.indexOf('\n'),
                    this.numeroDocumento.length), this.offsetX + 170, 80);
            }


            this.doc.setFontStyle('normal');
            this.doc.setFontSize(10);

            if (this.tipoDocumento === 'LIEFERSCHEIN' ||
                this.tipoDocumento === 'LIEFERSCHEIN KOPIE' ||
                this.tipoDocumento === 'DELIVERY NOTE' ||
                this.tipoDocumento === 'RECHNUNG' ||
                this.tipoDocumento === 'AUFTRAGSBESTÄTIGUNG' ||
                this.tipoDocumento === 'ORDER CONFIRMATION' ||
                this.tipoDocumento === 'GUTSCHRIFT' ||
                this.tipoDocumento === 'INVOICE' ||
                this.tipoDocumento === 'CREDIT NOTE') {
                if (this.auftragsNr.length > 0) {
                    this.doc.setFontStyle('bold');
                    this.doc.text(this.auftragsNr.substring(0, this.auftragsNr.indexOf('\n')), this.offsetX + 135, 70);
                    this.doc.setFontStyle('normal');
                    this.doc.text(this.auftragsNr.substring(this.auftragsNr.indexOf('\n'), this.auftragsNr.length), this.offsetX + 135, 70);
                }
                if (this.auftragsDatum.length > 0) {
                    this.doc.setFontStyle('bold');
                    this.doc.text(this.auftragsDatum.substring(0, this.auftragsDatum.indexOf('\n')), this.offsetX + 135, 80);
                    this.doc.setFontStyle('normal');
                    this.doc.text(this.auftragsDatum.substring(this.auftragsDatum.indexOf('\n'),
                        this.auftragsDatum.length), this.offsetX + 135, 80);
                }
                if (this.tipoDocumento === 'RECHNUNG' ||
                    this.tipoDocumento === 'GUTSCHRIFT' ||
                    this.tipoDocumento === 'CREDIT NOTE' ||
                    this.tipoDocumento === 'INVOICE') {
                    this.doc.setFontStyle('bold');
                    this.doc.text(this.recNr.substring(0, this.recNr.indexOf('\n')), this.offsetX + 135, 60);
                    this.doc.setFontStyle('normal');
                    this.doc.text(this.recNr.substring(this.recNr.indexOf('\n'), this.recNr.length), this.offsetX + 135, 60);

                    this.doc.setFontStyle('bold');
                    this.doc.text(this.lieferNr.substring(0, this.lieferNr.indexOf('\n')), this.offsetX + 100, 70);
                    this.doc.setFontStyle('normal');
                    this.doc.text(this.lieferNr.substring(this.lieferNr.indexOf('\n'), this.lieferNr.length), this.offsetX + 100, 70);

                    this.doc.setFontStyle('bold');
                    this.doc.text(this.lieferDatum.substring(0, this.lieferDatum.indexOf('\n')), this.offsetX + 100, 80);
                    this.doc.setFontStyle('normal');
                    this.doc.text(this.lieferDatum.substring(this.lieferDatum.indexOf('\n'),
                        this.lieferDatum.length), this.offsetX + 100, 80);
                }

                if (this.tipoDocumento === 'LIEFERSCHEIN KOPIE' ||
                    this.tipoDocumento === 'LIEFERSCHEIN') {
                    // console.log(this.aufragNr2);
                    this.doc.setFontStyle('bold');
                    this.doc.text(this.aufragNr2.substring(0, this.aufragNr2.indexOf('\n')), this.offsetX + 135, 60);
                    this.doc.setFontStyle('normal');
                    this.doc.text(this.aufragNr2.substring(this.aufragNr2.indexOf('\n'), this.recNr.length), this.offsetX + 135, 60);
                }
            }

            if (!this.contattiStampati) {
                let maxOffset = 0;
                let tempOffset = 0;
                let maxBodyLine = 0;
                let tempBodyLine = 0;
                let titoli = true;
                this.contattiStampati = true;
                this.doc.setFontSize(8);

                // console.log(this.deUmlaut(this.tipoDocumento), this.tipoDocumento);

                if (this.tipoDocumento !== 'LIEFERSCHEIN' &&
                    this.tipoDocumento !== 'LIEFERSCHEIN KOPIE' &&
                    this.tipoDocumento !== 'DELIVERY NOTE' &&
                    this.tipoDocumento !== 'AUFTRAGSBESTÄTIGUNG' &&
                    this.tipoDocumento !== 'RECHNUNG' &&
                    this.tipoDocumento !== 'INVOICE' &&
                    this.tipoDocumento !== 'ORDER CONFIRMATION' &&
                    this.tipoDocumento !== 'GUTSCHRIFT' &&
                    this.tipoDocumento !== 'CREDIT NOTE'
                ) {
                    this.doc.setFontStyle('bold');
                    this.doc.text(this.angebotsNr.substring(0, this.angebotsNr.indexOf('\n')), this.offsetX + 10, this.BODY_OFFSET);
                    this.doc.setFontStyle('normal');
                    this.doc.text(this.angebotsNr.substring(this.angebotsNr.indexOf('\n'),
                        this.angebotsNr.length), this.offsetX + 10, this.BODY_OFFSET);

                    this.doc.setFontStyle('bold');
                    if (this.tipoDocumento === 'BESTELLUNG' || this.tipoDocumento === 'ANFRAGE') {
                        this.doc.text('Agebotsdatum', this.offsetX + 36, this.BODY_OFFSET);
                    }
                    this.doc.setFontStyle('normal');

                    this.tempDatoCheNonSoPercheStaQui.forEach(value => {
                        this.contattiCliente.push(value);
                    });

                    this.contattiCliente.forEach(value => {
                        if (titoli) {
                            this.doc.setFontStyle('bold');
                            titoli = false;
                        } else {
                            this.doc.setFontStyle('normal');
                        }
                        this.doc.text(value, this.offsetX + 68, this.BODY_OFFSET + tempOffset);
                        tempOffset += this.INTERLINEA;
                        tempBodyLine++;
                        if (tempOffset > maxOffset) {
                            maxOffset = tempOffset;
                        }
                        if (tempBodyLine > maxBodyLine) {
                            maxBodyLine = tempBodyLine;
                        }
                    });

                    tempOffset = 0;
                    tempBodyLine = 0;
                    titoli = true;
                    this.contattoZZ.forEach(value => {
                        if (titoli) {
                            this.doc.setFontStyle('bold');
                            titoli = false;
                        } else {
                            this.doc.setFontStyle('normal');
                        }
                        this.doc.text(value, this.offsetX + 134, this.BODY_OFFSET + tempOffset);
                        tempOffset += this.INTERLINEA;
                        tempBodyLine++;
                        if (tempOffset > maxOffset) {
                            maxOffset = tempOffset;
                        }
                        if (tempBodyLine > maxBodyLine) {
                            maxBodyLine = tempBodyLine;
                        }
                    });

                } else {
                    titoli = true;
                    tempOffset = 0;
                    tempBodyLine = 0;

                    this.KOPF_ANS.forEach(value => {
                        // console.log(value);
                        if (titoli) {
                            this.doc.setFontStyle('bold');
                            titoli = false;
                        } else {
                            this.doc.setFontStyle('normal');
                        }
                        this.doc.text(value, this.offsetX + 10, this.BODY_OFFSET + tempOffset);
                        tempOffset += this.INTERLINEA;
                        tempBodyLine++;
                    });

                    titoli = true;

                    this.ihreUstIdNr.forEach(value => {
                        // console.log(value);
                        if (titoli) {
                            this.doc.setFontStyle('bold');
                            titoli = false;
                        } else {
                            this.doc.setFontStyle('normal');
                        }
                        this.doc.text(value, this.offsetX + 10, this.BODY_OFFSET + tempOffset);
                        tempOffset += this.INTERLINEA;
                        tempBodyLine++;
                    });

                    titoli = true;
                    this.ihreBestellNr.forEach(value => {
                        if (titoli) {
                            this.doc.setFontStyle('bold');
                            titoli = false;
                        } else {
                            this.doc.setFontStyle('normal');
                        }
                        this.doc.text(value, this.offsetX + 10, this.BODY_OFFSET + tempOffset);
                        tempOffset += this.INTERLINEA;
                        tempBodyLine++;
                    });

                    titoli = true;
                    this.ihrZeichen.forEach(value => {
                        if (titoli) {
                            this.doc.setFontStyle('bold');
                            titoli = false;
                        } else {
                            this.doc.setFontStyle('normal');
                        }
                        this.doc.text(value.replace(/^\s+/, ''), this.offsetX + 10, this.BODY_OFFSET + tempOffset);
                        tempOffset += this.INTERLINEA;
                        tempBodyLine++;
                    });

                    if (tempOffset > maxOffset) {
                        maxOffset = tempOffset;
                    }
                    if (tempBodyLine > maxBodyLine) {
                        maxBodyLine = tempBodyLine;
                    }

                    tempOffset = 0;
                    tempBodyLine = 0;
                    titoli = true;
                    this.KOPF_RGAN.forEach(value => {
                        // // console.log(value);

                        if (titoli) {
                            this.doc.setFontStyle('bold');
                            titoli = false;
                        } else {
                            this.doc.setFontStyle('normal');
                        }
                        this.doc.text(value, this.offsetX + 100, this.BODY_OFFSET + tempOffset);
                        tempOffset += this.INTERLINEA;
                        tempBodyLine++;
                    });

                    titoli = true;
                    this.unsereUstIdNr.forEach(value => {
                        // // console.log(value);

                        if (titoli) {
                            this.doc.setFontStyle('bold');
                            titoli = false;
                        } else {
                            this.doc.setFontStyle('normal');
                        }
                        this.doc.text(value, this.offsetX + 100, this.BODY_OFFSET + tempOffset);
                        tempOffset += this.INTERLINEA;
                        tempBodyLine++;
                    });

                    titoli = true;
                    this.bestellDatum.forEach(value => {
                        // // console.log(value);

                        if (titoli) {
                            this.doc.setFontStyle('bold');
                            titoli = false;
                        } else {
                            this.doc.setFontStyle('normal');
                        }
                        this.doc.text(value, this.offsetX + 100, this.BODY_OFFSET + tempOffset);
                        tempOffset += this.INTERLINEA;
                        tempBodyLine++;
                    });

                    titoli = true;
                    this.contattoZZ.forEach(value => {
                        // // console.log(value);

                        if (titoli) {
                            this.doc.setFontStyle('bold');
                            titoli = false;
                        } else {
                            this.doc.setFontStyle('normal');
                        }
                        this.doc.text(value.replace(/^\s+/, ''), this.offsetX + 100, this.BODY_OFFSET + tempOffset);
                        tempOffset += this.INTERLINEA;
                        tempBodyLine++;
                    });

                    if (tempOffset > maxOffset) {
                        maxOffset = tempOffset;
                    }
                    if (tempBodyLine > maxBodyLine) {
                        maxBodyLine = tempBodyLine;
                    }
                }
                this.addNewLine(maxBodyLine + 1);
            }
        }
    }

    getCommandLine() {
        switch (process.platform) {
            case 'linux' :
                return 'xdg-open ';
            case 'darwin' :
                return 'open ';
            case 'win32' :
                return ' ';
            default :
                return ' ';
        }
    }

    private printPreviewPDF(pdfSrc: any, nomeFile: string) {
        const historyPath = path.join(this.electron.remote.app.getPath('appData'), this.electron.remote.app.getName(), 'history');
        let fileName;
        try {
            if (!this.electron.fs.existsSync(historyPath)) {
                this.electron.fs.mkdirSync(historyPath);
            }
            const counter = (this.ls.retrieve('counterpdf') === 'undefined') ? 1 : this.ls.retrieve('counterpdf') + 1;
            this.ls.store('counterpdf', counter);
            fileName = path.join(historyPath, this.deUmlaut(nomeFile) + '_' + counter.toString() + '.pdf');
            if (this.electron.fs.existsSync(fileName)) {
                this.electron.fs.unlinkSync(fileName);
            }
            this.electron.fs.writeFileSync(fileName, pdfSrc);
            this.electron.printError(this.getCommandLine() + '"' + fileName + '"');
            this.electron.childProcess.exec(this.getCommandLine() + '"' + fileName + '"', (error, stdout, stderr) => {
                if (error) {
                    this.electron.printError('exec error: \n' + stdout + '\n' + stderr);
                    return;
                }
            });
        } catch (err) {
            this.electron.printError(err);
        }
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

    genKontakt(posizione) {
        switch (posizione) {
            case 0: {
                return ['Our Contact', 'Frau Sezer, Seher', 'seher.sezer@zzdrivetech.com', '0721/6205-36'];
            }
            case 1: {
                return ['Our Contact', 'Nicole Naiel', 'nicole.naiel@zzdrivetech.com', '0721/6205-37'];
            }
            case 2: {
                return ['Our Contact', 'Michael Batzler', 'michael.batzler@zzdrivetech.com', '0721/6205-72'];
            }
            case 3: {
                return ['Our Contact', 'Klaus Korte', 'klaus.korte@zzdrivetech.com', '0721/6205-51'];
            }
            case 4: {
                return ['Our Contact', 'Nadine Cordeiro', 'nadine.cordeiro@zzdrivetech.com', '0721/6205-35'];
            }
            default: {
                return ['Our Contact', 'ZZ Drive Tech GmbH', 'info@zzdrivetech.com', '0721/6205-0'];
            }
        }
    }

    containsAny(str) {

        // console.log('CERCO', str, this.user);
        for (let i = 0; i !== this.user.length; i++) {
            const substring = this.user[i];
            if (str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === substring) {
                return i;
            }
        }
        return -1;
    }
}
