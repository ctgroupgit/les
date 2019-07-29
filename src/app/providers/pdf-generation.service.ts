import {Injectable, Inject} from '@angular/core';
import * as jsPDF from 'jspdf';
import {ElectronService} from './electron.service';
import logoData from '../../logozz.json';
import {LocalStorageService} from 'ngx-webstorage';
import {rootPath} from 'electron-root-path';
import * as path from 'path';

@Injectable({
  providedIn: 'root'
})
export class PdfGenerationService {

  offsetX = 0;
  logozz: any = logoData;
  doc: any;
  CURRENT_BODY_LINE = 0;
  MAX_BODY_LINE: number;
  INTERLINEA = 4;
  POS_OFFSET = 0;
  KOPF_OFFSET = 0;
  POS_BODY_START: number;
  COLUMN_HEADER = [];
  FUSS_OFFSET = 0;
  NOT_LAST_PAGE = false;
  KOPF_OFFSETK = 0;
  temp_nr_doc: string;

  INTERROMPI = false;

  intestazione: string;
  tipoDocumento: string;
  dataDocumento: string;
  numeroFornitore: string;
  numeroDocumento: string;


  constructor(private electron: ElectronService, private ls: LocalStorageService) {

  }

  public printOrder(data: string[]) {
    console.log(data);
    this.doc = new jsPDF({filters: ['ASCIIHexEncode']});
    // this.doc.addFont('courier', 'courier', 'normal');
    // this.doc.addFont('', '', 'normal');
    // this.doc.setFont('PTMono-Regular');
    this.temp_nr_doc = '';
    this.CURRENT_BODY_LINE = 0;
    this.POS_OFFSET = 0;
    this.KOPF_OFFSET = 0;
    this.COLUMN_HEADER = [];
    this.intestazione = '';
    this.tipoDocumento = '';
    this.dataDocumento = '';
    this.numeroFornitore = '';
    this.numeroDocumento = '';
    this.FUSS_OFFSET = 0;
    this.NOT_LAST_PAGE = false;
    this.KOPF_OFFSETK = 0;
    this.POS_BODY_START = 135;
    this.MAX_BODY_LINE = 27;

    let tempDatoCheNonSoPercheStaQui;

    const image = 'data:image/png;base64,' + this.logozz[0]['logozz'];
    // const image = this.logozz[0]['logozz'];
    // header
    this.doc.addImage(image, 'JPEG', 100, 1, 100, 54);
    this.doc.setFontSize(8);
    this.doc.setFont('default');
    this.doc.text('ZZ Drive Tech GmbH, An der Tagweide 12, 76139 Karlsruhe', 10, 40);
    this.addFooter();

    data.forEach((row) => {
      if (!this.INTERROMPI) {
        switch (row[1]) {
          case 'CONTROL': {
            break;
          }
          case 'KOPIEN': {
            this.doc.setFont('default');

            this.doc.setFontSize(15);
            this.doc.text(row[14], this.offsetX + 10, 90);
            this.tipoDocumento = row[14];
            tempDatoCheNonSoPercheStaQui = row[26];
            break;
          }
          case 'KOPF_USTID': {
            break;
          }
          case 'KOPF': {
            this.doc.setFont('default');

            this.dataDocumento = row[14] + '\n' + row[13];
            this.numeroDocumento = row[15] + '\n' + row[16];
            this.temp_nr_doc = row[16];
            this.numeroFornitore = row[17] + '\n' + row[18];


            this.intestazione = row[21] + '\n' + row[22] + '\n' + row[23] + '\n' + row[24];
            if (this.tipoDocumento === 'ANFRAGE') {
              this.addHeader();
            }
            break;
          }
          case 'KOPF_DATEN': {
            this.doc.setFont('default');
            this.doc.setFontSize(8);

            if (this.tipoDocumento === 'BESTELLUNG') {
              this.numeroFornitore = row[20] + '\n' + row[21];
              this.addHeader();
            }

            if (this.tipoDocumento !== 'ANFRAGE') {
              // Angebots-Nr
              this.doc.setFontStyle('bold');
              this.doc.text(row[14], this.offsetX + 10, 95);
            }
            // KundenNr/Ihre Zeichen
            this.doc.setFontStyle('bold');
            this.doc.text(row[16], this.offsetX + 70, 95);
            this.doc.text(row[22], this.offsetX + 130, 95);
            this.doc.setFontStyle('normal');

            // 124014
            this.doc.text(row[17], this.offsetX + 70, 100);

            // Unser Zeichen / Telefon

            this.doc.text(row[23], this.offsetX + 130, 100);

            this.doc.text(row[24], this.offsetX + 130, 105);

            this.doc.text(tempDatoCheNonSoPercheStaQui, this.offsetX + 70, 115);
            break;
          }
          case 'KONTAKT': {
            this.doc.setFont('default');
            // FAX
            this.doc.setFontSize(8);
            this.doc.text(row[14], this.offsetX + 130, 110);
            // EMAIL
            this.doc.text(row[15], this.offsetX + 130, 115);
            // 08365-77027-0
            this.doc.text(row[17], this.offsetX + 70, 105);

            this.doc.text(row[24], this.offsetX + 70, 110);
            break;
          }
          case 'KOPF_TEXTF': {
            this.doc.setFont('courier');
            if (row[14] !== 't') {
              this.doc.setFontSize(10);
              this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 10, 125 + this.KOPF_OFFSET);
              this.KOPF_OFFSET += this.INTERLINEA;
            }
            this.KOPF_OFFSETK = this.KOPF_OFFSET;
            this.POS_BODY_START += this.INTERLINEA;
            this.MAX_BODY_LINE -= 1;
            break;
          }
          case 'KOPF_TEXTK': {
            this.doc.setFont('courier');
            if (row[14] !== 't') {
              this.doc.setFontSize(8);
              this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 10, 125 + this.KOPF_OFFSETK);
              this.KOPF_OFFSETK += this.INTERLINEA;
            }
            this.POS_BODY_START += this.INTERLINEA;
            this.MAX_BODY_LINE -= 1;
            break;
          }
          case 'KOPF_TEXTA': {
            this.doc.setFont('courier');
            if (row[14] !== 't') {
              this.doc.setFontSize(8);
              this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 10, 125 + this.KOPF_OFFSETK);
              this.KOPF_OFFSETK += this.INTERLINEA;
            }
            this.POS_BODY_START += this.INTERLINEA;
            this.MAX_BODY_LINE -= 1;
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
            this.addTableHeader();
            break;
          }
          case 'POS': {

            if (this.CURRENT_BODY_LINE > 0) {
              this.POS_OFFSET += this.INTERLINEA;
            }
            this.doc.setFont('default');

            this.doc.setFontSize(8);

            this.doc.text(row[2], this.offsetX + 10, this.POS_BODY_START + this.POS_OFFSET);

            this.doc.setFontStyle('bold');
            this.doc.text(row[14] + ' ' + row[15], this.offsetX + 25, this.POS_BODY_START + this.POS_OFFSET);
            this.POS_OFFSET += this.INTERLINEA;
            this.doc.text(row[16], this.offsetX + 25, this.POS_BODY_START + this.POS_OFFSET);

            this.doc.setFontStyle('normal');
            this.doc.text(row[3], this.offsetX + 115, this.POS_BODY_START + this.POS_OFFSET);

            this.doc.text(row[19], this.offsetX + 130, this.POS_BODY_START + this.POS_OFFSET);

            this.doc.text(row[4], this.offsetX + 145, this.POS_BODY_START + this.POS_OFFSET);

            this.doc.text(row[9], this.offsetX + 165, this.POS_BODY_START + this.POS_OFFSET);

            this.doc.text(row[6], this.offsetX + 180, this.POS_BODY_START + this.POS_OFFSET);
            this.POS_OFFSET += this.INTERLINEA;

            this.doc.text(row[17] + ' ' + row[18], this.offsetX + 25, this.POS_BODY_START + this.POS_OFFSET);
            this.POS_OFFSET += this.INTERLINEA;

            this.doc.setFontStyle('bold');
            this.doc.text(row[22] + ' ' + row[23], this.offsetX + 25, this.POS_BODY_START + this.POS_OFFSET);

            if (this.tipoDocumento === 'BESTELLUNG') {
              this.doc.text(row[21] + ' ' + row[13], this.offsetX + 90, this.POS_BODY_START + this.POS_OFFSET);
            } else if (this.tipoDocumento === 'ANFRAGE') {
              this.doc.text(row[13], this.offsetX + 145, this.POS_BODY_START + this.POS_OFFSET);
            }
            this.doc.setFontStyle('normal');
            this.CURRENT_BODY_LINE++;
            this.POS_OFFSET += this.INTERLINEA;
            break;
          }
          case 'POS2': {
            this.doc.setFont('default');
            if (this.tipoDocumento === 'ANFRAGE') {
              this.doc.setFontSize(8);
              this.doc.text(row[20], this.offsetX + 25, this.POS_BODY_START + this.POS_OFFSET);
              this.doc.text(row[21], this.offsetX + 25 + row[20].length + 10, this.POS_BODY_START + this.POS_OFFSET);
              this.CURRENT_BODY_LINE++;
              this.POS_OFFSET += this.INTERLINEA;
            }
            break;
          }
          case 'POS 3': {
            break;
          }
          case 'POS_TEXTP': {
            this.doc.setFont('courier');
            this.doc.setFontSize(8);
            this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 25, this.POS_BODY_START + this.POS_OFFSET);
            this.CURRENT_BODY_LINE++;
            this.POS_OFFSET += this.INTERLINEA;
            break;
          }
          case 'FUSS_WERTE': {
            this.doc.setFont('default');
            this.NOT_LAST_PAGE = true;
            this.doc.addPage();
            this.addHeader();
            this.addFooter();
            this.doc.setFontSize(14);
            this.doc.setFontStyle('bold');
            this.doc.text(row[15] + '    ' + row[4], this.offsetX + 10, 100 + this.FUSS_OFFSET);
            // this.doc.text(row[4], this.offsetX + 160, 100 + this.FUSS_OFFSET);
            this.FUSS_OFFSET += this.INTERLINEA * 2;
            break;
          }
          case 'FUSS_PRE': {
            this.doc.setFont('default');
            this.doc.setFontStyle('normal');
            this.doc.setFontSize(10);
            this.doc.text(row[15], this.offsetX + 10, 100 + this.FUSS_OFFSET);
            this.doc.text(row[14], this.offsetX + 10 + row[15].length + 5, 100 + this.FUSS_OFFSET);
            this.FUSS_OFFSET += this.INTERLINEA;
            break;
          }
          case 'FUSS_LIEFD': {


            break;
          }
          case 'POFUSS_PRES2': {

            break;
          }
          case 'FUSS_TEXTF': {
            if (row[14] !== 't') {
              this.doc.setFont('courier');
              this.doc.setFontStyle('normal');
              this.doc.setFontSize(10);
              this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 10, 100 + this.FUSS_OFFSET);
            }
            this.FUSS_OFFSET += this.INTERLINEA;
            break;
          }
          default: {
            break;
          }
        }

        console.log('NUMERO DI LINEE BOBY: ' + this.CURRENT_BODY_LINE);
        if (this.CURRENT_BODY_LINE === this.MAX_BODY_LINE && !this.NOT_LAST_PAGE) {
          console.log('nuova pagina');
          this.doc.addPage();
          this.addHeader();
          this.addFooter();
          this.CURRENT_BODY_LINE = 0;
          console.log(this.CURRENT_BODY_LINE);
          this.POS_OFFSET = 0;
          this.POS_BODY_START = 120;
          if (this.CURRENT_BODY_LINE === 0 && !this.NOT_LAST_PAGE) {
            this.addTableHeader();
          }
        }

      }
    });

    if (this.ls.retrieve('automaticOpenPDF')) {
      this.printPreviewPDF(this.doc.output());
    } else {
      this.doc.save();
    }
  }

  addTableHeader() {
    this.doc.setFont('default');
    this.doc.setFontStyle('bold');
    this.doc.setFontSize(8);
    if (this.COLUMN_HEADER.length > 0) {
      this.doc.line(10, this.POS_BODY_START - 5, 200, this.POS_BODY_START - 5);
      this.doc.line(10, this.POS_BODY_START - 10, 200, this.POS_BODY_START - 10);
      if (this.COLUMN_HEADER[0] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        console.log(this.COLUMN_HEADER[0]);
        this.doc.text(this.COLUMN_HEADER[0], this.offsetX + 10, this.POS_BODY_START - 6);
      }
      this.doc.setFontSize(8);
      if (this.COLUMN_HEADER[1] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        this.doc.text(this.COLUMN_HEADER[1], this.offsetX + 25, this.POS_BODY_START - 6);
      }
      if (this.COLUMN_HEADER[2] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        this.doc.text(this.COLUMN_HEADER[2], this.offsetX + 115, this.POS_BODY_START - 6);
      }
      if (this.COLUMN_HEADER[3] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        this.doc.text(this.COLUMN_HEADER[3], this.offsetX + 130, this.POS_BODY_START - 6);
      }
      if (this.COLUMN_HEADER[4] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        this.doc.text(this.COLUMN_HEADER[4], this.offsetX + 145, this.POS_BODY_START - 6);
      }
      if (this.COLUMN_HEADER[5] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        this.doc.text(this.COLUMN_HEADER[5], this.offsetX + 165, this.POS_BODY_START - 6);
      }
      if (this.COLUMN_HEADER[6] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        this.doc.text(this.COLUMN_HEADER[6], this.offsetX + 180, this.POS_BODY_START - 6);
      }
    }
    this.doc.setFontStyle('normal');
  }

  addFooter() {
    this.doc.setFont('default');
    // footer
    this.doc.line(10, 275, 200, 275);
    this.doc.setFontSize(7);
    this.doc.text('ZZ Drive Tech GmbH', 10, 278);
    this.doc.text('An der Tagweide 12', 10, 281);
    this.doc.text('76139 Karlsruhe', 10, 284);

    this.doc.text('Sitz der Gesellschaft Karlsruhe', 45, 278);
    this.doc.text('Registergericht: AG Mannheim HRB 721742', 45, 281);
    this.doc.text('Geschäftsführer: Pasqualino Di Matteo', 45, 284);
    this.doc.text('Ust-IdNr.: DE815609203', 45, 287);
    this.doc.text('St.-Nr.: 35009/07754', 45, 290);

    this.doc.text('Tel. +49 (0)721/6205-0', 120, 278);
    this.doc.text('Fax +49 (0)721/6205-10', 120, 281);
    this.doc.text('info@zzdrivetech.com', 120, 284);
    this.doc.text('www.zzdrivetech.com', 120, 287);

    this.doc.text('UniCredit Bank AG', 160, 278);
    this.doc.text('IBAN: DE81660202860022616510', 160, 281);
    this.doc.text('BIC: HYVEDEMM475', 160, 284);
  }

  addHeader() {
    this.doc.setFont('default');
    // logo
    console.log(this.logozz[0]['logozz']);
    const image = 'data:image/png;base64,' + this.logozz[0]['logozz'];
    this.doc.addImage(image, 'JPEG', 100, 1, 100, 54);
    // header
    this.doc.setFontSize(8);
    this.doc.text('ZZ Drive Tech GmbH, An der Tagweide 12, 76139 Karlsruhe', 10, 40);
    // this.doc.setFontStyle('bold');
    this.doc.setFontSize(15);
    this.doc.text(this.tipoDocumento, this.offsetX + 10, 90);
    this.doc.setFontSize(10);
    // this.doc.setFontStyle('normal');
    this.doc.text(this.intestazione, this.offsetX + 10, 55);
    this.doc.text(this.dataDocumento, this.offsetX + 140, 60);
    this.doc.text(this.numeroFornitore, this.offsetX + 140, 70);
    this.doc.text(this.numeroDocumento, this.offsetX + 140, 80);
  }

  getCommandLine() {
    switch (process.platform) {
      case 'darwin' :
        return 'open ';
      case 'win32' :
        return 'start ';
      default :
        return 'xdg-open ';
    }
  }

  private printPreviewPDF(pdfSrc: any) {
    const historyPath = path.join(this.electron.remote.app.getAppPath(), 'history');
    const data = new Date();
    const date = data.getFullYear() + '-' + (data.getMonth() + 1) + '-' + data.getDate();
    const time = data.getHours() + '.' + data.getMinutes() + '.' + data.getSeconds();
    let fileName;
    console.log(historyPath);
    try {
      if (!this.electron.fs.existsSync(historyPath)) {
        this.electron.fs.mkdirSync(historyPath);
      }
      fileName = path.join(historyPath, this.tipoDocumento.trim() + '_' + this.temp_nr_doc.trim() + '_' + date + '_' + time + '.pdf');
      if (this.electron.fs.existsSync(fileName)) {
        this.electron.fs.unlinkSync(fileName);
      }
      console.log(fileName);
      this.electron.fs.writeFileSync(fileName, pdfSrc);
      this.electron.childProcess.exec(this.getCommandLine() + ' ' + fileName, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: error`);
          return;
        }
      });
    } catch (err) {
      console.error(err);
    }
  }
}
