import { Injectable } from '@angular/core';
import {DocumentModel, TableFooterModel, TableRowModel} from './model';
import {ElectronService} from './electron.service';
import {LocalStorageService} from 'ngx-webstorage';
import {GlobalService} from './global.service';
import {LoggerService} from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class GutschriftService {

  bodyRow: TableRowModel;
  constructor(private electron: ElectronService,
              private ls: LocalStorageService,
              private gb: GlobalService,
              private log: LoggerService
  ) { }

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
          docClass.dh1.title = row[19].trim();
          docClass.dh1.description = row[20].trim();

          docClass.dh3.title = row[15].trim();
          docClass.dh3.description = row[16].trim();

          break;
        }
        case 'KOPF_DATEN': {
          docClass.dh2.title = row[18].trim();
          docClass.dh2.description = row[20].trim();
          docClass.dh5.title = row[18].trim();
          docClass.dh5.description = row[20].trim();
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
          docClass.documentNumber.title = row[15].trim();
          docClass.documentNumber.description = row[16].trim();
          docClass.dh4.title = row[17].trim();
          docClass.dh4.description = row[14].trim();
          docClass.dh5.title = row[18].trim();
          docClass.dh5.description = row[12].trim();

          break;
        }
        case 'KOPF_POSUEB': {
          for (let idx = 14; idx !== 23; idx++) {
            if (row[idx].trim().length > 0) {
              docClass.tableHeading.push(row[idx].trim());
            }
          }
          docClass.documentFooter.push(row[23]);
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
          this.bodyRow.col4 = row[19];
          this.bodyRow.col5 = this.gb.currencyFormatDE(row[4]);
          this.bodyRow.col6 = row[5];
          this.bodyRow.col7 = this.gb.currencyFormatDE(row[6]);
          docClass.tableRow.push(this.bodyRow);
          break;
        }
        case 'POS_RB': {
          this.bodyRow.col2.priceDetailDescription = row[14].trim();
          this.bodyRow.col2.priceDetailValue = row[3].trim() + ' ' + row[15].trim();
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
          docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim(), 25));
          break;
        }
        case 'FUSS_LIEFD': {
          docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim(), 25));
          break;
        }
        case 'FUSS_LIEFB': {
          docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim(), 25));
          break;
        }
        case 'FUSS_PACK': {
          docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim(), 25));
          break;
        }
        case 'FUSS_GEW': {
          docClass.documentFooter.push(' ');
          docClass.documentFooter.push(this.gb.normalizeChar(row[16].trim() + ':' + this.gb.StrToNumber(row[3]) + ' KG', 25));
          docClass.documentFooter.push(' ');
          break;
        }
        case 'FUSS_ZAHLB': {
          docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim(), 25));
          break;
        }
        case 'FUSS_ZAHLA': {
          docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim(), 25));
          break;
        }
        case 'FUSS_PRES2': {
          docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim(), 25));
          break;
        }
        case 'FUSS_VART': {
          docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim(), 25));
          break;
        }
        case 'FUSS_TEXTF': {
          docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim().substr(1, row[14].length), 25));
          break;
        }
      }
    });
    this.log.info('', docClass);
    return docClass;
  }
}
