import { Injectable } from '@angular/core';
import {ElectronService} from './electron.service';
import {LocalStorageService} from 'ngx-webstorage';
import {GlobalService} from './global.service';
import {LoggerService} from './logger.service';
import {DocumentModel, TableFooterModel, TableRowModel} from './model';

@Injectable({
  providedIn: 'root'
})
export class LieferscheinService {
  bodyRow: TableRowModel;
  tempCheckSameValue = '';
  constructor(private electron: ElectronService,
              private ls: LocalStorageService,
              private gb: GlobalService,
              private log: LoggerService) { }


  generate(data = [], type: string) {
    const docClass = new DocumentModel();
    docClass.docType = type;
    data.forEach( (row) => {
      switch (row[1]) {
        case 'CONTROL': {
          break;
        }
        case 'KOPIEN': {
          break;
        }
        case 'KOPF_ANS': {
          break;
        }
        case 'KOPF_RGAN': {
          break;
        }
        case 'KOPF': {
          docClass.heading.push(row[21].trim());
          docClass.heading.push(row[22].trim());
          docClass.heading.push(row[23].trim());
          docClass.heading.push(row[24].trim());
          docClass.heading.push(row[25].trim());
          docClass.documentDate.title = row[14].trim();
          docClass.documentDate.description = row[12].trim();
          docClass.documentNumber.title = row[17].trim();
          docClass.documentNumber.description = row[18].trim();

          docClass.dh1.title = row[19].trim();
          docClass.dh1.description = row[20].trim();


          break;
        }
        case 'KOPF_DATEN': {
          docClass.dh3.title = row[14].trim();
          docClass.dh3.description = row[28].trim();
          docClass.docHeadingDetail.yourContact.push('-B' + row[15]);
          docClass.docHeadingDetail.yourContact.push(row[16]);
          docClass.docHeadingDetail.yourContact.push(row[22]);
          docClass.docHeadingDetail.yourContact.push('-B' + row[17]);
          docClass.docHeadingDetail.yourContact.push(row[12]);
          docClass.docHeadingDetail.yourContact.push('-B' + 'Your Sign');
          docClass.docHeadingDetail.yourContact.push(row[19]);
          docClass.docHeadingDetail.ourContact.push('-B' + 'Our Contact');
          this.gb.genKontakt(row).forEach((val) => {
            docClass.docHeadingDetail.ourContact.push(val);
          });
          break;
        }
        case 'KOPF_DATEN2': {

          docClass.dh2.title = row[19].trim();
          docClass.dh2.description = row[20].trim();

          break;
        }
        case 'KOPF_POSUEB': {
          for (let idx = 14; idx <= 19; idx++) {
            if (row[idx].trim().length > 0) {
              docClass.tableHeading.push(row[idx].trim());
            }
          }
          docClass.lastLine = row[23];
          break;
        }
        case 'KOPF_TEXTF': {
          if (row[14].length > 1) {
            docClass.docHeadingDetail.detail.push(row[14].substr(1, row[14].length));
          }
          break;
        }
        case 'KOPF_TEXTK': {
          if (row[14].length > 1) {
            docClass.docHeadingDetail.detail.push(row[14].substr(1, row[14].length));
          }
          break;
        }
        case 'KOPF_TEXTA': {
          if (row[14].length > 1) {
            docClass.docHeadingDetail.detail.push(row[14].substr(1, row[14].length));
          }
          break;
        }
        case 'KONTAKT': {
          break;
        }
        case 'KOPF_USTID': {
          docClass.docHeadingDetail.yourContact.push('-B' + row[14]);
          docClass.docHeadingDetail.yourContact.push(row[15]);
          docClass.docHeadingDetail.yourContact.push('-B' + row[16]);
          docClass.docHeadingDetail.yourContact.push(row[17]);
          break;
        }
        case 'POS': {
          this.bodyRow = new TableRowModel();
          this.bodyRow.col1 = row[2];
          this.bodyRow.col2.rowDescription = this.gb.normalizeChar(row[14] + row[15], 20);
          if (row[16].length > 0) {
            this.bodyRow.col2.otherDetail.push(row[16]);
          }
          if (row[17].length > 0) {
            this.bodyRow.col2.otherDetail.push(row[17]);
          }
          if (row[18].length > 0) {
            this.bodyRow.col2.otherDetail.push(row[18]);
          }
          this.bodyRow.col3 = this.gb.StrToNumber(row[3]);
          this.bodyRow.col4 = this.gb.StrToNumber(row[4]);
          this.bodyRow.col5 = this.gb.StrToNumber(row[5]);
          this.bodyRow.col6 = row[19];
          // this.bodyRow.col7 = this.gb.currencyFormatDE(row[6]);
          docClass.tableRow.push(this.bodyRow);
          break;
        }
        case 'POS_RB': {
          break;
        }
        case 'POS2': {
          break;
        }
        case 'POS 3': {
          break;
        }
        case 'POS_TEXTA': {
          docClass.tableRow[docClass.tableRow.length - 1].col2.otherDetail.push(row[14]
              .substr(1, row[14].length));
          break;
        }
        case 'POS_TEXTP': {
          docClass.tableRow[docClass.tableRow.length - 1].col2.otherDetail.push(row[14]
              .substr(1, row[14].length));
          break;
        }
        case 'POS_ZUSCH': {
          break;
        }
        case 'FUSS_WERTE': {
          const tempRowFooter = new TableFooterModel();
          tempRowFooter.col1 = this.gb.normalizeChar(row[15].trim(), 20);
          tempRowFooter.col2 = row[3];
          tempRowFooter.col3 = row[4];
          docClass.tableFooter.push(tempRowFooter);
          break;
        }
        case 'FUSS_PRE': {
          let temStr = '';
          if (row[15] !== this.tempCheckSameValue) {
            temStr += row[15].trim();
            this.tempCheckSameValue = row[15];
          }
          temStr += row[14].trim();
          docClass.documentFooter.push(this.gb.normalizeChar(temStr, 25));
          break;
        }
        case 'FUSS_LIEFD': {
          let temStr = '';
          if (row[15] !== this.tempCheckSameValue) {
            temStr += row[15].trim();
            this.tempCheckSameValue = row[15];
          }
          temStr += row[14].trim();
          docClass.documentFooter.push(this.gb.normalizeChar(temStr, 25));
          break;
        }
        case 'FUSS_LIEFB': {
          let temStr = '';
          if (row[15] !== this.tempCheckSameValue) {
            temStr += row[15].trim();
            this.tempCheckSameValue = row[15];
          }
          temStr += row[14].trim();
          docClass.documentFooter.push(this.gb.normalizeChar(temStr, 25));
          break;
        }
        case 'FUSS_PACK': {
          let temStr = '';
          if (row[15] !== this.tempCheckSameValue) {
            temStr += row[15].trim();
            this.tempCheckSameValue = row[15];
          }
          temStr += row[14].trim();
          docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[2].trim() + ' ' + row[14].trim(), 25));
          break;
        }
        case 'FUSS_GEW': {
          docClass.documentFooter.push(' ');
          let temStr = '';
          if (row[16] !== this.tempCheckSameValue) {
            temStr += row[15].trim();
            this.tempCheckSameValue = row[16];
          }
          temStr += row[16].trim() + ' ' + row[3].trim() + ' Kg';
          docClass.documentFooter.push(this.gb.normalizeChar(temStr, 25));
          docClass.documentFooter.push(' ');
          break;
        }
        case 'FUSS_ZAHLB': {
          let temStr = '';
          if (row[15] !== this.tempCheckSameValue) {
            temStr += row[15].trim();
            this.tempCheckSameValue = row[15];
          }
          temStr += ((row[16].trim().length > 0) ? row[16].trim() : '')  + ((row[14].trim().length > 0) ? ' ' + row[14] : '');
          break;
        }
        case 'FUSS_ZAHLA': {
          let temStr = '';
          if (row[15] !== this.tempCheckSameValue) {
            temStr += row[15].trim();
            this.tempCheckSameValue = row[15];
          }
          temStr += ((row[16].trim().length > 0) ? row[16].trim() : '')  + ((row[14].trim().length > 0) ? ' ' + row[14] : '');
          break;
        }
        case 'FUSS_PRES2': {
          let temStr = '';
          if (row[15] !== this.tempCheckSameValue) {
            temStr += row[15].trim();
            this.tempCheckSameValue = row[15];
          }
          temStr += ((row[16].trim().length > 0) ? row[16].trim() : '')  + ((row[14].trim().length > 0) ? ' ' + row[14] : '');
          docClass.documentFooter.push(this.gb.normalizeChar(temStr, 25));
          break;
        }
        case 'FUSS_VART': {
          let temStr = '';
          if (row[15] !== this.tempCheckSameValue) {
            temStr += row[15].trim();
            this.tempCheckSameValue = row[15];
          }
          temStr += ((row[16].trim().length > 0) ? row[16].trim() : '')  + ((row[14].trim().length > 0) ? ' ' + row[14] : '');
          docClass.documentFooter.push(this.gb.normalizeChar(temStr, 25));
          break;
        }
        case 'FUSS_TEXTF': {
          let temStr = '';
          if (row[15] !== this.tempCheckSameValue) {
            temStr += row[15].trim();
            this.tempCheckSameValue = row[15];
          }
          temStr += row[14].trim().substr(1, row[14].length);
          docClass.documentFooter.push(this.gb.normalizeChar(temStr, 25));
          break;
        }
      }
    });
    this.log.info('', docClass);
    return docClass;
  }
}
