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
  INTERLINEA = 3.5;
  BODY_OFFSET: number;
  COLUMN_HEADER = [];
  FUSS_OFFSET = 0;
  FINE_BODY = false;
  temp_nr_doc: string;

  INTERROMPI = false;

  intestazione: string;
  tipoDocumento: string;
  dataDocumento: string;
  numeroFornitore: string;
  numeroDocumento: string;
  POS_SPACE = [];


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
    this.COLUMN_HEADER = [];
    this.intestazione = '';
    this.tipoDocumento = '';
    this.dataDocumento = '';
    this.numeroFornitore = '';
    this.numeroDocumento = '';
    this.FINE_BODY = false;
    this.BODY_OFFSET = 125;
    this.MAX_BODY_LINE = 27;
    this.POS_SPACE = [];

    let tempDatoCheNonSoPercheStaQui;

    const image = 'data:image/png;base64,' + this.logozz[0]['logozz'];
    // const image = this.logozz[0]['logozz'];
    // header
    this.doc.addImage(image, 'JPEG', 100, 1, 100, 54);
    this.doc.setFontSize(8);
    this.doc.setFont('default');
    this.doc.text('ZZ Drive Tech GmbH, An der Tagweide 12, 76139 Karlsruhe', 10, 40);
    this.addFooter();

    let PosCount;
    let tempPosZUSCHCount = 0;
    data.forEach((row) => {
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
    });

    let startLeRigheInMezzo = 0;
    let tempNetto;
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
            this.tipoDocumento = row[14].replace(/\s/g, '').trim();

            if (this.tipoDocumento === 'BESTELLUNG') {
              this.doc.setFontSize(7);
              this.doc.setFont('courier');
              this.doc.text('ME = Mengeneinheit: ST = Stück; g = Gramm; kg = Kilogramm    PE = Preiseinheit: 0=1 Stück; 1=pro 10; ' +
                '2=pro 100; 3=pro 10', this.offsetX + 10, 273);
            }

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
            this.doc.setFontSize(10);
            this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 10, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.MAX_BODY_LINE -= 1;
            break;
          }
          case 'KOPF_TEXTK': {
            this.doc.setFont('courier');
            this.doc.setFontSize(8);
            this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 10, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.MAX_BODY_LINE -= 1;
            break;
          }
          case 'KOPF_TEXTA': {
            this.doc.setFont('courier');
            this.doc.setFontSize(8);
            this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 10, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.MAX_BODY_LINE -= 1;
            break;
          }
          case 'POS': {
            tempNetto = row[6];
            startLeRigheInMezzo = 0;
            if (this.CURRENT_BODY_LINE === 0) {
              this.addTableHeader();
            }
            if (this.CURRENT_BODY_LINE > 0) {
              this.BODY_OFFSET += this.INTERLINEA;
            }

            this.doc.setFont('courier');

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

            this.doc.text(row[4], this.offsetX + 145, this.BODY_OFFSET);

            this.doc.text(row[9], this.offsetX + 165, this.BODY_OFFSET);

            this.doc.text(row[5].trim(), this.offsetX + 180, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;

            this.doc.text(row[17], this.offsetX + 25, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.doc.text(row[18], this.offsetX + 25, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;

            if (this.POS_SPACE[parseInt(row[2], 10)] > 0) {
              startLeRigheInMezzo = this.BODY_OFFSET;
              this.BODY_OFFSET += this.INTERLINEA * this.POS_SPACE[row[2]];
            }

            if (row[23].trim().length > 0) {
              this.doc.setFontStyle('bold');
              this.doc.text(row[22].trim() + ' ' + row[23], this.offsetX + 25, this.BODY_OFFSET);
            }

            this.doc.setFontStyle('bold');
            this.doc.text(row[21].trim() + ' ' + row[13], this.offsetX + 130, this.BODY_OFFSET);

            console.log(tempNetto);
            if (tempNetto !== '') {
              this.doc.setFontStyle('normal');
              this.doc.text('netto', this.offsetX + 165, this.BODY_OFFSET);
              this.doc.text(tempNetto.toString(), this.offsetX + 180, this.BODY_OFFSET);
            }

            this.doc.setFontStyle('normal');
            this.CURRENT_BODY_LINE++;
            this.BODY_OFFSET += this.INTERLINEA;
            break;
          }
          case 'POS2': {
            this.doc.setFont('courier');
            if (row[19].length > 0) {
              this.doc.setFontSize(8);
              this.doc.text(row[18] + ' ' + row[19], this.offsetX + 25, this.BODY_OFFSET);
              this.CURRENT_BODY_LINE++;
              this.BODY_OFFSET += this.INTERLINEA;
            }
            if (row[21].length > 0) {
              this.doc.setFontSize(8);
              this.doc.text(row[20] + ' ' + row[21], this.offsetX + 25, this.BODY_OFFSET);
              this.CURRENT_BODY_LINE++;
              this.BODY_OFFSET += this.INTERLINEA;
            }
            if (row[23].length > 0) {
              this.doc.setFontSize(8);
              this.doc.text(row[22] + ' ' + row[23], this.offsetX + 25, this.BODY_OFFSET);
              this.CURRENT_BODY_LINE++;
              this.BODY_OFFSET += this.INTERLINEA;
            }
            if (row[25].length > 0) {
              this.doc.setFontSize(8);
              this.doc.text(row[24] + ' ' + row[25], this.offsetX + 25, this.BODY_OFFSET);
              this.CURRENT_BODY_LINE++;
              this.BODY_OFFSET += this.INTERLINEA;
            }
            break;
          }
          case 'POS 3': {
            break;
          }
          case 'POS_TEXTA': {
            this.doc.setFont('courier');
            this.doc.setFontSize(8);
            this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 25, this.BODY_OFFSET);
            this.CURRENT_BODY_LINE++;
            this.BODY_OFFSET += this.INTERLINEA;
            break;
          }
          case 'POS_TEXTP': {
            this.doc.setFont('courier');
            this.doc.setFontSize(8);
            this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 25, this.BODY_OFFSET);
            this.CURRENT_BODY_LINE++;
            this.BODY_OFFSET += this.INTERLINEA;
            break;
          }
          case 'POS_ZUSCH': {
            this.doc.setFont('courier');
            this.doc.setFontSize(8);
            this.doc.text(row[14].replace(/\s/g, '').trim(), this.offsetX + 130, startLeRigheInMezzo);
            this.doc.text(row[3].replace(/\s/g, '').trim(), this.offsetX +  145, startLeRigheInMezzo);
            this.doc.text(row[15].replace(/\s/g, '').trim(), this.offsetX + 165, startLeRigheInMezzo);

            this.doc.text(row[4].replace(/\s/g, '').trim(), this.offsetX + 180, startLeRigheInMezzo);
            startLeRigheInMezzo += this.INTERLINEA;
            break;
          }
          case 'FUSS_WERTE': {
            this.doc.setFont('default');
            if (!this.FINE_BODY) {
              // this.BODY_OFFSET += this.INTERLINEA * 2;
              // this.CURRENT_BODY_LINE++;
              // this.CURRENT_BODY_LINE++;
              this.newPage();
              this.doc.line(10, this.BODY_OFFSET - this.INTERLINEA, 200, this.BODY_OFFSET - this.INTERLINEA);
            }

            this.FINE_BODY = true;
            this.doc.setFont('courier');
            this.doc.setFontSize(10);
            this.doc.setFontStyle('bold');

            const datoUno = row[15].replace(/\s/g, '').trim();
            const datoDue = row[4].replace(/\s/g, '').trim();

            // const txtWidth1 = this.doc.getStringUnitWidth(datoUno) * 10 / this.doc.internal.scaleFactor;
            // const txtWidth2 = this.doc.getStringUnitWidth(datoDue) * 10 / this.doc.internal.scaleFactor;
            // const width = this.doc.internal.pageSize.getWidth();
            //
            // this.doc.text(datoUno , this.offsetX + txtWidth1 + (width - txtWidth1), this.BODY_OFFSET );
            this.doc.text(datoUno, this.offsetX + this.offsetX + 130, this.BODY_OFFSET);
            this.doc.text(datoDue, this.offsetX + 180, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA * 2;
            this.CURRENT_BODY_LINE++;
            this.CURRENT_BODY_LINE++;
            break;
          }
          case 'FUSS_PRE': {
            this.doc.setFont('default');
            this.doc.setFontStyle('normal');
            this.doc.setFontSize(10);
            this.doc.text(row[15], this.offsetX + 10, this.BODY_OFFSET);
            this.doc.text(row[14], this.offsetX + 10 + row[15].length + 5, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.CURRENT_BODY_LINE++;
            break;
          }
          case 'FUSS_LIEFD': {
            this.doc.setFont('courier');
            this.doc.setFontStyle('normal');
            this.doc.setFontSize(10);
            this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 10, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.CURRENT_BODY_LINE++;
            break;
          }
          case 'POFUSS_PRES2': {
            this.doc.setFont('courier');
            this.doc.setFontStyle('normal');
            this.doc.setFontSize(10);
            this.doc.text(row[14].substring(1, row[14].length), this.offsetX + 10, this.BODY_OFFSET);
            this.BODY_OFFSET += this.INTERLINEA;
            this.CURRENT_BODY_LINE++;
            break;
          }
          case 'FUSS_TEXTF': {
            this.doc.setFont('courier');
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

        console.log('NUMERO DI LINEE BOBY: ' + this.CURRENT_BODY_LINE);
        if (this.CURRENT_BODY_LINE === this.MAX_BODY_LINE ) {
          this.newPage();
          if (this.CURRENT_BODY_LINE === 0 && !this.FINE_BODY) {
            this.addTableHeader();
          }
        }

      }
    });
    const openAuto = (this.ls.retrieve('automaticOpenPDF') === null ||
      this.ls.retrieve('automaticOpenPDF') === '' ||
      this.ls.retrieve('automaticOpenPDF') === 'undefined') ? true : this.ls.retrieve('automaticOpenPDF');
    if (openAuto) {
      this.printPreviewPDF(this.doc.output());
    } else {
      this.doc.save();
    }
  }

  newPage() {
    console.log('nuova pagina');
    this.doc.addPage();
    this.addHeader();
    this.addFooter();
    this.CURRENT_BODY_LINE = 0;
    this.BODY_OFFSET = 100;
    this.MAX_BODY_LINE = 27;
  }


  addTableHeader() {
    this.doc.setFont('courier');
    this.doc.setFontStyle('bold');
    this.doc.setFontSize(8);
    this.BODY_OFFSET += this.INTERLINEA;
    if (this.COLUMN_HEADER.length > 0) {
      this.doc.line(10, this.BODY_OFFSET + 2, 200, this.BODY_OFFSET + 2);
      this.doc.line(10, this.BODY_OFFSET - 4, 200, this.BODY_OFFSET - 4);
      if (this.COLUMN_HEADER[0] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        console.log(this.COLUMN_HEADER[0]);
        this.doc.text(this.COLUMN_HEADER[0], this.offsetX + 10, this.BODY_OFFSET);
      }
      this.doc.setFontSize(8);
      if (this.COLUMN_HEADER[1] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        this.doc.text(this.COLUMN_HEADER[1].trim(), this.offsetX + 25, this.BODY_OFFSET);
      }
      if (this.COLUMN_HEADER[2] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        this.doc.text(this.COLUMN_HEADER[2].trim(), this.offsetX + 115, this.BODY_OFFSET);
      }
      if (this.COLUMN_HEADER[3] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        this.doc.text(this.COLUMN_HEADER[3].trim(), this.offsetX + 130, this.BODY_OFFSET);
      }
      if (this.COLUMN_HEADER[4] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        this.doc.text(this.COLUMN_HEADER[4].trim(), this.offsetX + 145, this.BODY_OFFSET);
      }
      if (this.COLUMN_HEADER[5] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        this.doc.text(this.COLUMN_HEADER[5].trim(), this.offsetX + 165, this.BODY_OFFSET);
      }
      if (this.COLUMN_HEADER[6] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        this.doc.text(this.COLUMN_HEADER[6].trim(), this.offsetX + 180, this.BODY_OFFSET);
      }
      if (this.COLUMN_HEADER[7] !== 'undefined' && this.COLUMN_HEADER[0] !== null) {
        this.doc.text(this.COLUMN_HEADER[7].trim(), this.offsetX + 192, this.BODY_OFFSET);
      }
    }
    this.doc.setFont('default');
    this.doc.setFontStyle('normal');
    this.BODY_OFFSET += this.INTERLINEA * 2;
  }

  addFooter() {
    this.doc.setFont('default');
    // footer
    if (this.tipoDocumento === 'BESTELLUNG') {
      this.doc.setFontSize(7);
      this.doc.setFont('courier');
      this.doc.text('ME = Mengeneinheit: ST = Stück; g = Gramm; kg = Kilogramm    PE = Preiseinheit: 0=1 Stück; 1=pro 10; ' +
        '2=pro 100; 3=pro 10', this.offsetX + 10, 273);
    }
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
    const historyPath = path.join(this.electron.remote.app.getPath('appData'), this.electron.remote.app.getName(), 'history');
    const data = new Date();
    const date = data.getFullYear() + (data.getMonth() + 1) + data.getDate();
    const time = data.getHours() + data.getMinutes() + data.getSeconds();
    let fileName;
    console.log(historyPath);
    try {
      if (!this.electron.fs.existsSync(historyPath)) {
        this.electron.fs.mkdirSync(historyPath);
      }
      const counter = (this.ls.retrieve('counterpdf') === 'undefined') ? 1 : this.ls.retrieve('counterpdf') + 2;
      this.ls.store('counterpdf', counter);
      fileName = path.join(historyPath, 'file_' + date + time + '_' + counter.toString() + '.pdf');
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
