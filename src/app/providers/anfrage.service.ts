import {Injectable} from '@angular/core';
import {DocumentModel, FieldModel, TableFooterModel, TableRowModel} from './model';
import {ElectronService} from './electron.service';
import {LocalStorageService} from 'ngx-webstorage';
import {GlobalService} from './global.service';
import {LoggerService} from './logger.service';

@Injectable({
    providedIn: 'root'
})
export class AnfrageService {
    docClass: DocumentModel = new DocumentModel();
    allDocClass: DocumentModel[] = [];
    bodyRow: TableRowModel;
    constructor(private electron: ElectronService,
                private ls: LocalStorageService,
                private gb: GlobalService,
                private log: LoggerService
    ) {
    }

    generate(data = [], type) {
        this.allDocClass.pop();
        let totDoc = 0;
        data.forEach((row) => {
            switch (row[1]) {
                case 'CONTROL': {
                    break;
                }
                case 'KOPIEN': {
                    if (totDoc > 0) {
                        this.allDocClass.push(this.docClass);
                    }
                    this.docClass = new DocumentModel();
                    this.docClass.docType = type;
                    this.docClass.docHeadingDetail.youContactLastLine = row[26].trim();
                    totDoc++;
                    break;
                }
                case 'KOPF_ANS': {
                    this.docClass.docHeadingDetail.yourContact.push('#B#' + row[20].trim());
                    this.docClass.docHeadingDetail.yourContact.push(row[21].trim());
                    this.docClass.docHeadingDetail.yourContact.push(row[22].trim());
                    this.docClass.docHeadingDetail.yourContact.push(row[23].trim());
                    this.docClass.docHeadingDetail.yourContact.push(row[24].trim());
                    break;
                }
                case 'KOPF_RGAN': {
                    break;
                }
                case 'KOPF': {
                    this.docClass.heading.push(row[21].trim());
                    this.docClass.heading.push(row[22].trim());
                    this.docClass.heading.push(row[23].trim());
                    this.docClass.heading.push(row[24].trim());
                    this.docClass.heading.push(row[25].trim());
                    this.docClass.documentDate.title = row[14].trim();
                    this.docClass.documentDate.description = row[13].trim();
                    this.docClass.documentNumber.title = row[15].trim();
                    this.docClass.documentNumber.description = row[16].trim();
                    break;
                }
                case 'KOPF_DATEN': {
                    // this.docClass.dh1.title = row[20].trim();
                    // this.docClass.dh1.description = row[21].trim();
                    this.docClass.dh1.title = row[14].trim();
                    this.docClass.dh1.description = row[15].trim();

                    this.docClass.docHeadingDetail.ourContact.push('#B#' + row[22].trim());
                    this.gb.genKontakt(row).forEach((val) => {
                        this.docClass.docHeadingDetail.ourContact.push(val);
                    });
                    this.docClass.docHeadingDetail.yourContact.push('#B#' + row[16].trim());
                    this.docClass.docHeadingDetail.yourContact.push(row[17].trim());
                    break;
                }
                case 'KOPF_DATEN2': {
                    break;
                }
                case 'KOPF_POSUEB': {
                    for (let idx = 14; idx <= 21; idx++) {
                        if (row[idx].trim().length > 0) {
                            this.docClass.tableHeading.push(row[idx].trim());
                        }
                    }
                    this.docClass.documentFooter.push(row[23]);
                    break;
                }
                case 'KOPF_TEXTF': {
                    if (row[14].length > 1) {
                        this.docClass.docHeadingDetail.detail.push(row[14].substr(1, row[14].length));
                    }
                    break;
                }
                case 'KOPF_TEXTK': {
                    if (row[14].length > 1) {
                        this.docClass.docHeadingDetail.detail.push(row[14].substr(1, row[14].length));
                    }
                    break;
                }
                case 'KOPF_TEXTA': {
                    if (row[14].length > 1) {
                        this.docClass.docHeadingDetail.detail.push(row[14].substr(1, row[14].length));
                    }
                    break;
                }
                case 'KONTAKT': {
                    this.docClass.docHeadingDetail.yourContact.push(row[24].trim());
                    this.docClass.docHeadingDetail.yourContact.push(row[25].trim());
                    break;
                }
                case 'KOPF_USTID': {

                    break;
                }
                case 'POS': {
                    this.bodyRow = new TableRowModel();
                    this.bodyRow.col1 = row[2];
                    this.bodyRow.col2.rowDescription = row[14];
                    if (row[15].trim().replace('\t', '').length > 0) {
                        this.bodyRow.col2.otherDetail.push(row[15].trim().replace('\t', ''));
                    }
                    if (row[16].trim().length > 0) {
                        this.bodyRow.col2.otherDetail.push(row[16].trim());
                    }
                    if (row[17].trim().length > 0) {
                        this.bodyRow.col2.otherDetail.push(row[17].trim());
                    }
                    if (row[18].trim().length > 0) {
                        this.bodyRow.col2.otherDetail.push(row[18].trim());
                    }

                    if (row[23].trim().length > 0) {
                        this.bodyRow.col2.otherDetail.push(
                            row[22].trim() + ((row[22].trim().indexOf(':') >= 0) ? ' ' : ': ') + row[23].trim());
                    }

                    this.bodyRow.col3 = this.gb.StrToNumber(row[3]);
                    this.bodyRow.col4 = row[19];
                    this.bodyRow.col5 = row[13];
                    // this.bodyRow.col6 = this.gb.StrToNumber(row[9]);
                    // this.bodyRow.col7 = this.gb.currencyFormatDE(row[6]);

                    // const itmDet = new FieldModel();
                    // itmDet.title = row[21].trim();
                    // itmDet.description = row[13].trim();
                    //
                    // this.bodyRow.otherItemDetail.push(itmDet);
                    // KOMMISION:??????

                    // itmDet.title = row[22].trim();
                    // itmDet.description = row[13].trim();
                    // this.bodyRow.otherItemDetail.push(itmDet);
                    this.docClass.tableRow.push(this.bodyRow);
                    break;
                }
                case 'POS_RB': {
                    break;
                }
                case 'POS2': {
                    for (let col = 17; col <= 25; col += 2) {
                        if (row[col].trim().length > 0) {
                            this.docClass.tableRow[this.docClass.tableRow.length - 1].col2.otherDetail.push(
                                row[col - 1].trim() + ((row[col - 1].trim().indexOf(':') >= 0) ? ' ' : ': ') + row[col].trim());
                        }
                    }
                    break;
                }
                case 'POS 3': {
                    for (let col = 17; col <= 20; col += 2) {
                        if (row[col].trim().length > 0) {
                            this.docClass.tableRow[this.docClass.tableRow.length - 1].col2.otherDetail.push(
                                row[col - 1].trim() + ((row[col - 1].trim().indexOf(':') >= 0) ? ' ' : ': ') + row[col].trim());
                        }
                    }
                    break;
                }
                case 'POS_TEXTA': {
                    this.docClass.tableRow[this.docClass.tableRow.length - 1].col2.otherDetail.push(row[14]
                        .substr(1, row[14].length));
                    break;
                }
                case 'POS_TEXTP': {
                    this.docClass.tableRow[this.docClass.tableRow.length - 1].col2.otherDetail.push(row[14]
                        .substr(1, row[14].length));
                    break;
                }
                case 'POS_ZUSCH': {
                    const pos_zus = new FieldModel();
                    pos_zus.title = row[14] + ' ' + row[15];
                    pos_zus.description = this.gb.currencyFormatDE(row[3]);
                    this.docClass.tableRow[this.docClass.tableRow.length - 1].otherItemDetail.push(pos_zus);
                    break;
                }
                case 'FUSS_WERTE': {
                    const tempRowFooter = new TableFooterModel();
                    tempRowFooter.col1 = this.gb.normalizeChar(row[15].trim(), 20);
                    tempRowFooter.col2 = row[3];
                    tempRowFooter.col3 = row[4];
                    this.docClass.tableFooter.push(tempRowFooter);
                    break;
                }
                case 'FUSS_PRE': {
                    this.docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim(), 25));
                    break;
                }
                case 'FUSS_LIEFD': {
                    this.docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() +
                        ((row[14].trim().length > 0) ? row[14].trim() : row[13].trim()), 25));
                    break;
                }
                case 'FUSS_LIEFB': {
                    this.docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim(), 25));
                    break;
                }
                case 'FUSS_PACK': {
                    this.docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim(), 25));
                    break;
                }
                case 'FUSS_GEW': {
                    this.docClass.documentFooter.push(' ');
                    this.docClass.documentFooter.push(this.gb.normalizeChar(row[16].trim() + ':' + this.gb.StrToNumber(row[3]) + ' KG', 25));
                    this.docClass.documentFooter.push(' ');
                    break;
                }
                case 'FUSS_ZAHLB': {
                    this.docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim(), 25));
                    break;
                }
                case 'FUSS_ZAHLA': {
                    this.docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim(), 25));
                    break;
                }
                case 'FUSS_PRES2': {
                    this.docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim(), 25));
                    break;
                }
                case 'FUSS_VART': {
                    this.docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim(), 25));
                    break;
                }
                case 'FUSS_TEXTF': {
                    this.docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() + row[14].trim().substr(1, row[14].length), 25));
                    break;
                }
            }
        });
        this.allDocClass.push(this.docClass);
         console.log(this.allDocClass);
        return this.allDocClass;
    }
}
