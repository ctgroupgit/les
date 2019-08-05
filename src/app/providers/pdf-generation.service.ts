import {Injectable, Inject} from '@angular/core';
import * as jsPDF from 'jspdf';
import {ElectronService} from './electron.service';
import logoData from '../../logozz.json';
import {LocalStorageService} from 'ngx-webstorage';
import {rootPath} from 'electron-root-path';
import * as path from 'path';
import {getLocaleFirstDayOfWeek} from "@angular/common";


@Injectable({
  providedIn: 'root'
})
export class PdfGenerationService {

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
  dataDocumento: string;
  kundenNr: string;
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
  auftragsDatum: string;
  angebotsNr: string;
  faxCliente: string;
  contattiStampati = false;
  ihreUstIdNr = [];
  unsereUstIdNr = [];
  ihreBestellNr = [];
  bestellDatum = [];
  ihrZeichen = [];
  sachbearbeit = [];

  constructor(private electron: ElectronService, private ls: LocalStorageService) {

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

  static normalizeChar(str: string, nrChar: number) {
    console.log(str);
    const newStr = str.replace(':', '').replace(' ', '');
    return newStr + ' '.repeat(nrChar - newStr.length) + ': ';
  }

  public printOrder(ar: string[]) {
    // this.doc.setFont('courier');

    this.data = ar;
    this.doc = new jsPDF({filters: ['ASCIIHexEncode']});

    this.CURRENT_BODY_LINE = 0;
    this.COLUMN_HEADER = [];
    this.datiCliente = '';
    this.tipoDocumento = '';
    this.dataDocumento = '';
    this.kundenNr = '';
    this.numeroDocumento = '';
    this.FINE_BODY = false;
    this.BODY_OFFSET = 95;
    this.MAX_BODY_LINE = 41;
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
    this.sachbearbeit = [];
    this.ihreUstIdNr = [];
    this.KOPF_TEXT = [];
    this.ultimeRighe = [];

    this.doc.setFontSize(8);
    this.doc.setFont('courier');
    this.addFooter();

    let currentDataLength = 0;
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
      currentDataLength++;
      if (currentDataLength === this.data.length) {
        this.POS_SPACE.push(tempPosZUSCHCount.toString());
        tempPosZUSCHCount = 0;
      }
    });

    let startLeRigheInMezzo = 0;
    let tempNetto;
    currentDataLength = 0;

    this.data.forEach((row) => {
      if (!this.INTERROMPI) {
        switch (row[1]) {
          case 'CONTROL': {
            console.log('INTERPRETO','CONTROL');
            break;
          }
          case 'KOPIEN': {
            console.log('INTERPRETO','KOPIEN');
            if (!this.isStart) {
              this.newDocument();
            }
            this.tipoDocumento = row[14].replace(/\s/g, '').toLocaleUpperCase();

            this.tempDatoCheNonSoPercheStaQui = row[26]
              .replace(/;/g, ',')
              .replace(/ /g, '')
              .replace(/\\/g, ',')
              .replace(/\//g, ',')
              .split(',');
            this.isStart = false;
            break;
          }
          case 'KOPF': {
            console.log('INTERPRETO','KOPF');
            console.log('dopo');

            this.datiCliente = row[21] + '\n' + row[22] + '\n' + row[23] + '\n' + row[24];

            if (this.tipoDocumento === 'LIEFERSCHEIN' ) {
              this.numeroDocumento = row[17] + '\n' + row[18];
              this.kundenNr = row[19] + '\n' + row[20];
              this.temp_nr_doc = row[18];
              this.dataDocumento = row[14] + '\n' + row[12];

            } else {
              this.numeroDocumento = row[15] + '\n' + row[16];
              this.temp_nr_doc = row[16];
              this.kundenNr = row[17] + '\n' + row[18];
              this.dataDocumento = row[14] + '\n' + row[13];
            }

            break;
          }
          case 'KOPF_DATEN': {
            console.log('INTERPRETO','KOPF_DATEN');

            if (row[28].length > 0) {
              this.auftragsNr = row[14] + '\n' + row[28];
            }

            if (this.tipoDocumento === 'BESTELLUNG') {
              this.kundenNr = row[20] + '\n' + row[21];
            }

            this.ihreBestellNr.push(row[15]);
            this.ihreBestellNr.push(row[16]);
            this.angebotsNr = row[14] + '\n' + row[15];

            this.bestellDatum.push(row[17]);
            this.bestellDatum.push(row[12]);

            this.ihrZeichen.push('');
            this.ihrZeichen.push(row[19]);

            this.contattiCliente.push(row[16]);
            if (row[17].length > 0) {
              this.contattiCliente.push(row[17]);
            }
            if (row[18].length > 0) {
              this.contattiCliente.push(row[18]);
            }

            this.contattoZZ.push(row[22]);
            this.contattoZZ.push(row[23]);
            this.contattoZZ.push(row[24]);

            break;
          }
          case 'KOPF_POSUEB': {
            console.log('INTERPRETO','KOPF_POSUEB');

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
            console.log('INTERPRETO','KOPF_TEXTF');
            this.KOPF_TEXT.push(row[14].substring(1, row[14].length));
            break;
          }
          case 'KOPF_TEXTK': {
            console.log('INTERPRETO','KOPF_TEXTK');
            this.KOPF_TEXT.push(row[14].substring(1, row[14].length));
            break;
          }
          case 'KOPF_TEXTA': {
            console.log('INTERPRETO','KOPF_TEXTA');
            this.KOPF_TEXT.push(row[14].substring(1, row[14].length));
            break;
          }
          case 'KONTAKT': {
            console.log('INTERPRETO','KONTAKT');
            this.sachbearbeit.push('');
            this.sachbearbeit.push(row[19]);
            this.sachbearbeit.push(row[17]);
            this.sachbearbeit.push(row[18]);
            if (row[24].length > 0) {
              this.contattiCliente.push(row[24]);
            }
            if (row[25].length > 0) {
              this.contattiCliente.push(row[25]);
            }
            this.contattoZZ.push(row[14]);
            this.contattoZZ.push(row[15]);
            this.faxCliente = 'Fax-Nr.: ' + row[24];

            if (this.tipoDocumento !== 'LIEFERSCHEIN' && this.tipoDocumento !== 'AUFTRAGSBESTÄTIGUNG') {
              this.addHeader();
              console.log('ho lanciato header');
              this.KOPF_TEXT.forEach(value => {
                this.doc.setFontSize(10);
                this.doc.text(value, this.offsetX + 10, this.BODY_OFFSET);
                this.BODY_OFFSET += this.INTERLINEA;
                this.MAX_BODY_LINE -= 1;
              });
            }
            break;
          }
          case 'KOPF_USTID': {
            console.log('INTERPRETO','KOPF_USTID');

            this.ihreUstIdNr.push(row[15]);
            this.unsereUstIdNr.push(row[16]);
            this.unsereUstIdNr.push(row[17]);
            break;
          }
          case 'POS': {
            console.log('INTERPRETO','POS');

            if (this.tipoDocumento === 'LIEFERSCHEIN' || this.tipoDocumento === 'AUFTRAGSBESTÄTIGUNG' || this.tipoDocumento === 'RECHNUNG') {
              this.addHeader();
              this.KOPF_TEXT.forEach(value => {
                this.doc.setFontSize(10);
                this.doc.text(value, this.offsetX + 10, this.BODY_OFFSET);
                this.BODY_OFFSET += this.INTERLINEA;
                this.MAX_BODY_LINE -= 1;
              });
            }

            tempNetto = row[6];
            startLeRigheInMezzo = 0;
            if (row[2] === '1') {
              this.addTableHeader();
            }
            if (this.CURRENT_BODY_LINE > 0) {
              this.BODY_OFFSET += this.INTERLINEA;
            }

            // this.doc.setFont('courier');

            this.doc.setFontSize(8);

            this.doc.text(row[2], this.offsetX + 10, this.BODY_OFFSET);

            this.doc.setFontStyle('bold');

            if (row[15].length > 0) {
              this.doc.text(row[14] + ' ' + row[15], this.offsetX + 25, this.BODY_OFFSET);
              this.BODY_OFFSET += this.INTERLINEA;
            }

            this.doc.text(row[16], this.offsetX + 25, this.BODY_OFFSET);

            this.doc.setFontStyle('normal');
            this.doc.text(row[3], this.offsetX + 115, this.BODY_OFFSET);

            this.doc.text(row[19], this.offsetX + 130, this.BODY_OFFSET);

            if (row[4] !== '') {
              this.doc.text(this.currencyFormatDE(row[4]), this.offsetX + 145, this.BODY_OFFSET);
            }

            this.doc.text(row[9], this.offsetX + 165, this.BODY_OFFSET);

            if (row[5] !== '') {
              this.doc.text(this.currencyFormatDE(row[5]), this.offsetX + 180, this.BODY_OFFSET);
            }
            this.BODY_OFFSET += this.INTERLINEA;

            this.doc.text(row[17], this.offsetX + 25, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.doc.text(row[18], this.offsetX + 25, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;

            const tempPonNumber = Number(row[2]) - 1;
            if (this.POS_SPACE[tempPonNumber] > 0) {
              startLeRigheInMezzo = this.BODY_OFFSET;
              this.BODY_OFFSET += this.INTERLINEA * this.POS_SPACE[tempPonNumber];
            }
            // console.log('BODY_OFFSET: ', this.BODY_OFFSET, 'startLeRigheInMezzo: ', startLeRigheInMezzo, this.POS_SPACE[tempPonNumber]);

            if (row[23].length > 0) {
              this.doc.setFontStyle('bold');
              this.doc.text(PdfGenerationService.normalizeChar(row[22], 25) + row[23], this.offsetX + 25, this.BODY_OFFSET);
            }

            if (row[13].length > 0 && row[21].length > 0) {
              this.doc.setFontStyle('bold');
              this.doc.text(row[21].replace(/\s/g, '') + ' ' + row[13], this.offsetX + 130, this.BODY_OFFSET);
            }
            // // console.log(tempNetto);
            if (tempNetto !== '') {
              this.doc.setFontStyle('normal');
              this.doc.text('netto', this.offsetX + 165, this.BODY_OFFSET);
              this.doc.text(this.currencyFormatDE(tempNetto), this.offsetX + 180, this.BODY_OFFSET);
            }

            this.doc.setFontStyle('normal');
            this.CURRENT_BODY_LINE++;
            this.BODY_OFFSET += this.INTERLINEA;
            break;
          }
          case 'POS2': {
            console.log('INTERPRETO','POS2');
            this.doc.setFontStyle('bold');
            if (row[19].length > 0) {
              this.doc.setFontSize(8);
              this.doc.text(PdfGenerationService.normalizeChar(row[18], 25) + row[19], this.offsetX + 25, this.BODY_OFFSET);
              this.CURRENT_BODY_LINE++;
              this.BODY_OFFSET += this.INTERLINEA;
            }
            if (row[17].length > 0) {
              this.doc.setFontSize(8);
              this.doc.text(PdfGenerationService.normalizeChar(row[16], 25) + row[17], this.offsetX + 25, this.BODY_OFFSET);
              this.CURRENT_BODY_LINE++;
              this.BODY_OFFSET += this.INTERLINEA;
            }
            if (row[21].length > 0) {
              this.doc.setFontSize(8);
              this.doc.text(PdfGenerationService.normalizeChar(row[20], 25) + row[21], this.offsetX + 25, this.BODY_OFFSET);
              this.CURRENT_BODY_LINE++;
              this.BODY_OFFSET += this.INTERLINEA;
            }
            if (row[23].length > 0) {
              this.doc.setFontSize(8);
              this.doc.text(PdfGenerationService.normalizeChar(row[22], 25) + row[23], this.offsetX + 25, this.BODY_OFFSET);
              this.CURRENT_BODY_LINE++;
              this.BODY_OFFSET += this.INTERLINEA;
            }
            if (row[25].length > 0) {
              this.doc.setFontSize(8);
              this.doc.text(PdfGenerationService.normalizeChar(row[24], 25) + row[25], this.offsetX + 25, this.BODY_OFFSET);
              this.CURRENT_BODY_LINE++;
              this.BODY_OFFSET += this.INTERLINEA;
            }
            this.doc.setFontStyle('normal');
            break;
          }
          case 'POS 3': {
            console.log('INTERPRETO','POS 3');
            this.doc.setFontStyle('bold');
            // this.doc.setFont('courier');
            this.doc.setFontSize(8);
            if (row[14].substring(1, 2) === 'I') {
              const itemCount = row[15];
              for (let _i = 0; _i < itemCount; _i++) {
                this.doc.text(PdfGenerationService.normalizeChar(row[16 + (_i * 2)], 25) + row[16 + (_i * 2) + 1], this.offsetX + 25, this.BODY_OFFSET);
                this.CURRENT_BODY_LINE++;
                this.BODY_OFFSET += this.INTERLINEA;
              }
              this.doc.setFontStyle('normal');
            }
            break;
          }
          case 'POS_TEXTA': {
            console.log('INTERPRETO','POS_TEXTA');
            // this.doc.setFont('courier');
            this.doc.setFontSize(8);
            this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 25, this.BODY_OFFSET);
            this.CURRENT_BODY_LINE++;
            this.BODY_OFFSET += this.INTERLINEA;
            break;
          }
          case 'POS_TEXTP': {
            console.log('INTERPRETO','POS_TEXTP');
            // this.doc.setFont('courier');
            this.doc.setFontSize(8);
            this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 25, this.BODY_OFFSET);
            this.CURRENT_BODY_LINE++;
            this.BODY_OFFSET += this.INTERLINEA;
            break;
          }
          case 'POS_ZUSCH': {
            console.log('INTERPRETO','POS_ZUSCH');
            this.doc.setFontSize(8);
            this.doc.setFontStyle('normal');
            if (row[3] !== '') {
              this.doc.text(row[14].replace(/\s/g, ''), this.offsetX + 130, startLeRigheInMezzo);
              this.doc.text(this.currencyFormatDE(row[3]), this.offsetX + 145, startLeRigheInMezzo);
            }
            if (row[4] !== '') {
              this.doc.text(row[15].replace(/\s/g, ''), this.offsetX + 165, startLeRigheInMezzo);
              this.doc.text(this.currencyFormatDE(row[4]), this.offsetX + 180, startLeRigheInMezzo);
            }
            startLeRigheInMezzo += this.INTERLINEA;
            break;
          }
          case 'FUSS_WERTE': {
            console.log('INTERPRETO','FUSS_WERTE');
            if (!this.FINE_BODY) {
              // this.newPage();
              this.BODY_OFFSET += this.INTERLINEA;
              this.CURRENT_BODY_LINE++;
              this.doc.line(10, this.BODY_OFFSET - this.INTERLINEA, 200, this.BODY_OFFSET - this.INTERLINEA);
              this.doc.line(10, this.BODY_OFFSET + 2, 200, this.BODY_OFFSET + 2);
            }

            this.FINE_BODY = true;
            // this.doc.setFont('courier');
            this.doc.setFontSize(10);
            this.doc.setFontStyle('bold');

            const datoUno = row[15].replace(/\s/g, '');
            const datoDue = this.currencyFormatDE(row[4]);

            this.doc.text(datoUno, this.offsetX + this.offsetX + 130, this.BODY_OFFSET);
            this.doc.text(datoDue, this.offsetX + 180, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA * 2;
            this.CURRENT_BODY_LINE++;
            this.CURRENT_BODY_LINE++;
            break;
          }
          case 'FUSS_PRE': {
            console.log('INTERPRETO','FUSS_PRE');
            this.doc.setFontStyle('normal');
            this.doc.setFontSize(10);
            this.doc.text(row[15], this.offsetX + 10, this.BODY_OFFSET);
            this.doc.text(row[14], this.offsetX + 10 + row[15].length + 5, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.BODY_OFFSET += this.INTERLINEA;
            this.CURRENT_BODY_LINE++;
            this.CURRENT_BODY_LINE++;
            break;
          }
          case 'FUSS_LIEFD': {
            console.log('INTERPRETO','FUSS_LIEFD');
            this.doc.setFontStyle('normal');
            this.doc.setFontSize(10);
            this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 10, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.CURRENT_BODY_LINE++;
            break;
          }
          case 'FUSS_LIEFB': {
            console.log('INTERPRETO','FUSS_LIEFB');
            this.doc.setFontStyle('normal');
            this.doc.setFontSize(9);
            this.doc.text(PdfGenerationService.normalizeChar(row[15], 25) + row[14], this.offsetX + 10, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.CURRENT_BODY_LINE++;
            break;
          }
          case 'FUSS_PACK': {
            console.log('INTERPRETO','FUSS_PACK');
            this.doc.setFontStyle('normal');
            this.doc.setFontSize(9);
            this.doc.text(PdfGenerationService.normalizeChar(row[15], 25) + row[14], this.offsetX + 10, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.CURRENT_BODY_LINE++;
            break;
          }
          case 'FUSS_GEW': {
            console.log('INTERPRETO','FUSS_GEW');
            this.doc.setFontStyle('normal');
            this.doc.setFontSize(9);
            this.doc.text(PdfGenerationService.normalizeChar(row[15], 25) + row[14], this.offsetX + 10, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.CURRENT_BODY_LINE++;
            break;
          }
          case 'FUSS_ZAHLB': {
            console.log('INTERPRETO','FUSS_ZAHLB');
            this.doc.setFontStyle('normal');
            this.doc.setFontSize(10);
            this.doc.text(row[15] + ' ' + row[14], this.offsetX + 10, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.CURRENT_BODY_LINE++;
            break;
          }
          case 'FUSS_PRES2': {
            console.log('INTERPRETO','FUSS_PRES2');
            this.doc.setFontStyle('normal');
            this.doc.setFontSize(10);
            this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 10, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.CURRENT_BODY_LINE++;
            break;
          }
          case 'FUSS_TEXTF': {
            console.log('INTERPRETO','FUSS_TEXTF');
            if (!this.saluti) {
              this.BODY_OFFSET += this.INTERLINEA;
              this.CURRENT_BODY_LINE++;
              this.saluti = true;
            }
            this.doc.setFontStyle('normal');
            this.doc.setFontSize(10);
            this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 10, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.CURRENT_BODY_LINE++;
            break;
          }
          default: {
            break;
          }
        }
        if (this.CURRENT_BODY_LINE === this.MAX_BODY_LINE) {
          this.newPage();
          if (this.CURRENT_BODY_LINE === 0 && !this.FINE_BODY) {
            this.addTableHeader();
          }
        }
        currentDataLength++;

        if (currentDataLength === this.data.length) {
          this.doc.setFontStyle('normal');
          this.doc.setFontSize(10);
          this.BODY_OFFSET += this.INTERLINEA;
          this.CURRENT_BODY_LINE++;
          this.BODY_OFFSET += this.INTERLINEA;
          this.CURRENT_BODY_LINE++;
          this.doc.text(this.ultimeRighe, this.offsetX + 10, this.BODY_OFFSET);
        }
      }
    });
    this.printPreviewPDF(this.doc.output(), this.tipoDocumento + '_' + this.temp_nr_doc);
  }

  newPage() {
    // console.log('nuova pagina');
    this.doc.addPage();
    this.headerPrinted = false;
    this.addHeader();
    this.addFooter();
    this.CURRENT_BODY_LINE = 0;
    this.BODY_OFFSET = 95;
    this.MAX_BODY_LINE = 54;
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
    this.dataDocumento = '';
    this.kundenNr = '';
    this.numeroDocumento = '';
    this.FINE_BODY = false;
    this.BODY_OFFSET = 95;
    this.MAX_BODY_LINE = 41;
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
    this.sachbearbeit = [];
    this.ihreUstIdNr = [];
    this.KOPF_TEXT = [];
    this.ultimeRighe = [];
  }

  addTableHeader() {
    // this.doc.setFont('courier');
    this.doc.setFontStyle('bold');
    this.doc.setFontSize(7);
    this.BODY_OFFSET += this.INTERLINEA;
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
      if (this.COLUMN_HEADER[6] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        this.doc.text(this.trimText(this.COLUMN_HEADER[6], 5), this.offsetX + 180, this.BODY_OFFSET);
      }
      if (this.COLUMN_HEADER[7] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        this.doc.text(this.trimText(this.COLUMN_HEADER[7], 5), this.offsetX + 192, this.BODY_OFFSET);
      }
    }
    // this.doc.setFont('default');
    this.doc.setFontStyle('normal');
    this.BODY_OFFSET += this.INTERLINEA * 2;
  }

  addFooter() {
    this.doc.setFontStyle('normal');
    this.doc.setFontSize(7);
    const image = 'data:image/png;base64,' + this.logozz[0]['logoct'];
    this.doc.addImage(image, 'JPEG', 10, 271, 20, 21);
    // footer
    if (this.tipoDocumento === 'BESTELLUNG' ) {
      // this.doc.setFont('courier');
      this.doc.text('ME = Mengeneinheit: ST = Stück; g = Gramm; kg = Kilogramm    PE = Preiseinheit: 0=1 Stück; 1=pro 10; ' +
        '2=pro 100; 3=pro 10', this.offsetX + 10, 266);
    }
    this.doc.line(8, 268, 203, 268);
    this.doc.setFontStyle('normal');
    this.doc.setFontSize(7);
    this.doc.text('Made by CTGROUP IT Department', 120, 293);
    this.doc.text('build(' + this.electron.remote.app.getVersion() + ')', 183, 293);

    this.doc.text('Sitz der Gesellschaft Karlsruhe', 45, 272);
    this.doc.text('Registergericht: AG Mannheim HRB 721742', 45, 275);
    this.doc.text('Geschäftsführer: Pasqualino Di Matteo', 45, 278);
    this.doc.text('Ust-IdNr.: DE815609203', 45, 281);
    this.doc.text('St.-Nr.: 35009/07754', 45, 284);
    this.doc.text('ZZ Drive Tech GmbH', 45, 287);
    this.doc.text('An der Tagweide 12', 45, 290);
    this.doc.text('76139 Karlsruhe', 45, 293);

    this.doc.text('Tel. +49 (0)721/6205-0', 120, 272);
    this.doc.text('Fax +49 (0)721/6205-10', 120, 275);
    this.doc.text('info@zzdrivetech.com', 120, 278);
    this.doc.text('www.zzdrivetech.com', 120, 281);

    this.doc.text('UniCredit Bank AG', 160, 272);
    this.doc.text('IBAN: DE81660202860022616510', 160, 275);
    this.doc.text('BIC: HYVEDEMM475', 160, 278);
  }

  addHeader() {
    if (!this.headerPrinted) {
      this.headerPrinted = true;
      const image = 'data:image/png;base64,' + this.logozz[0]['logozz'];
      this.doc.addImage(image, 'JPEG', 100, 1, 100, 54);
      this.doc.setFontSize(8);
      this.doc.text('ZZ Drive Tech GmbH, An der Tagweide 12, 76139 Karlsruhe', 10, 30);
      this.doc.setFontSize(15);
      this.doc.setFontStyle('bold');
      this.doc.text(this.tipoDocumento, this.offsetX + 10, 85);
      this.doc.setFontStyle('normal');
      this.doc.setFontSize(10);
      this.doc.text(this.faxCliente, this.offsetX + 10, 40);
      this.doc.text(this.datiCliente, this.offsetX + 10, 50);
      this.doc.setFontStyle('bold');
      this.doc.text(this.dataDocumento.substring(0, this.dataDocumento.indexOf('\n')), this.offsetX + 160, 60);
      this.doc.setFontStyle('normal');
      this.doc.text(this.dataDocumento.substring(this.dataDocumento.indexOf('\n'), this.dataDocumento.length), this.offsetX + 160, 60);
      this.doc.setFontStyle('bold');
      this.doc.text(this.kundenNr.substring(0, this.kundenNr.indexOf('\n')), this.offsetX + 160, 70);
      this.doc.setFontStyle('normal');
      this.doc.text(this.kundenNr.substring(this.kundenNr.indexOf('\n'), this.kundenNr.length), this.offsetX + 160, 70);
      this.doc.setFontStyle('bold');
      this.doc.text(this.numeroDocumento.substring(0, this.numeroDocumento.indexOf('\n')), this.offsetX + 160, 80);
      this.doc.setFontStyle('normal');
      this.doc.text(this.numeroDocumento.substring(this.numeroDocumento.indexOf('\n'), this.numeroDocumento.length), this.offsetX + 160, 80);
      if (this.tipoDocumento === 'LIEFERSCHEIN') {
        if (this.auftragsNr.length > 0) {
          this.doc.setFontStyle('bold');
          this.doc.text(this.auftragsNr.substring(0, this.auftragsNr.indexOf('\n')), this.offsetX + 120, 70);
          this.doc.setFontStyle('normal');
          this.doc.text(this.auftragsNr.substring(this.auftragsNr.indexOf('\n'), this.auftragsNr.length), this.offsetX + 120, 70);
        }
        if (this.auftragsDatum.length > 0) {
          this.doc.setFontStyle('bold');
          this.doc.text(this.auftragsDatum.substring(0, this.auftragsDatum.indexOf('\n')), this.offsetX + 120, 80);
          this.doc.setFontStyle('normal');
          this.doc.text(this.auftragsDatum.substring(this.auftragsDatum.indexOf('\n'), this.auftragsDatum.length), this.offsetX + 120, 80);
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

        if (this.tipoDocumento !== 'LIEFERSCHEIN' && this.tipoDocumento !== 'AUFTRAGSBESTÄTIGUNG' && this.tipoDocumento !== 'RECHNUNG') {
          this.doc.text(this.angebotsNr, this.offsetX + 10, this.BODY_OFFSET);

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
            this.doc.text(value, this.offsetX + 60, this.BODY_OFFSET + tempOffset);
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
            this.doc.text(value, this.offsetX + 130, this.BODY_OFFSET + tempOffset);
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

          tempOffset = 0;
          tempBodyLine = 0;
          titoli = true;
          console.log(this.ihreUstIdNr);
          this.ihreUstIdNr.forEach(value => {
            console.log(value);
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
          this.unsereUstIdNr.forEach(value => {
            // console.log(value);

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
            // console.log(value);

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
          this.sachbearbeit.forEach(value => {
            // console.log(value);

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
        this.BODY_OFFSET += maxOffset + this.INTERLINEA;
        this.CURRENT_BODY_LINE += maxBodyLine + 1;
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
}
