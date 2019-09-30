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

    bodyRow: TableRowModel;

    constructor(private electron: ElectronService,
                private ls: LocalStorageService,
                private gb: GlobalService,
                private log: LoggerService
    ) {
    }

    generate(data = [], type: string) {
        const docClass = new DocumentModel();
        docClass.docType = type;
        data.forEach((row) => {
            switch (row[1]) {
                case 'CONTROL': {
                    break;
                }
                case 'KOPIEN': {
                    docClass.docHeadingDetail.youContactLastLine = row[26].trim();
                    break;
                }
                case 'KOPF_ANS': {
                    docClass.docHeadingDetail.yourContact.push('-B' + row[20].trim());
                    docClass.docHeadingDetail.yourContact.push(row[21].trim());
                    docClass.docHeadingDetail.yourContact.push(row[22].trim());
                    docClass.docHeadingDetail.yourContact.push(row[23].trim());
                    docClass.docHeadingDetail.yourContact.push(row[24].trim());
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
                    docClass.documentDate.description = row[13].trim();
                    docClass.documentNumber.title = row[15].trim();
                    docClass.documentNumber.description = row[16].trim();
                    break;
                }
                case 'KOPF_DATEN': {
                    // docClass.dh1.title = row[20].trim();
                    // docClass.dh1.description = row[21].trim();
                    docClass.dh1.title = row[14].trim();
                    docClass.dh1.description = row[15].trim();

                    docClass.docHeadingDetail.ourContact.push('-B' + row[22].trim());
                    this.gb.genKontakt(row).forEach((val) => {
                        docClass.docHeadingDetail.ourContact.push(val);
                    });
                    docClass.docHeadingDetail.yourContact.push('-B' + row[16].trim());
                    docClass.docHeadingDetail.yourContact.push(row[17].trim());
                    break;
                }
                case 'KOPF_DATEN2': {
                    break;
                }
                case 'KOPF_POSUEB': {
                    for (let idx = 14; idx <= 21; idx++) {
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
                    docClass.docHeadingDetail.yourContact.push(row[24].trim());
                    docClass.docHeadingDetail.yourContact.push(row[25].trim());
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
                    docClass.tableRow.push(this.bodyRow);
                    break;
                }
                case 'POS_RB': {
                    break;
                }
                case 'POS2': {
                    for (let col = 17; col <= 25; col += 2) {
                        if (row[col].trim().length > 0) {
                            docClass.tableRow[docClass.tableRow.length - 1].col2.otherDetail.push(
                                row[col - 1].trim() + ((row[col - 1].trim().indexOf(':') >= 0) ? ' ' : ': ') + row[col].trim());
                        }
                    }
                    break;
                }
                case 'POS 3': {
                    for (let col = 17; col <= 20; col += 2) {
                        if (row[col].trim().length > 0) {
                            docClass.tableRow[docClass.tableRow.length - 1].col2.otherDetail.push(
                                row[col - 1].trim() + ((row[col - 1].trim().indexOf(':') >= 0) ? ' ' : ': ') + row[col].trim());
                        }
                    }
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
                    const pos_zus = new FieldModel();
                    pos_zus.title = row[14] + ' ' + row[15];
                    pos_zus.description = this.gb.currencyFormatDE(row[3]);
                    docClass.tableRow[docClass.tableRow.length - 1].otherItemDetail.push(pos_zus);
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
                    docClass.documentFooter.push(this.gb.normalizeChar(row[15].trim() +
                        ((row[14].trim().length > 0) ? row[14].trim() : row[13].trim()), 25));
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
        // this.log.info('', docClass);
        return docClass;
    }
}
