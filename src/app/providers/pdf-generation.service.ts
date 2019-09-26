import {Injectable} from '@angular/core';
import * as jsPDF from 'jspdf';
import {ElectronService} from './electron.service';
import logoData from '../../logozz.json';
import {LocalStorageService} from 'ngx-webstorage';
import * as path from 'path';
import {RechnungService} from './rechnung.service';
import {GlobalService} from './global.service';
import {DocumentModel} from './model';
import {LoggerService} from './logger.service';
import {min} from 'rxjs/operators';
import {LieferscheinService} from './lieferschein.service';
import {ProformaRechnungService} from './proforma-rechnung.service';
import {GutschriftService} from './gutschrift.service';
import {AuftragsbestaetigungService} from './auftragsbestaetigung.service';
import {BestellungService} from './bestellung.service';


@Injectable({
    providedIn: 'root'
})
export class PdfGenerationService {
    docClass = new DocumentModel;
    paper: jsPDF;
    DEFAULT_MAX_BODY_LINE = 39;
    PAGE_NUMBER = 0;
    MAX_BODY_LINE = 1;
    SLUG = 4;
    CURRENT_BODY_OFFSET = 95;
    CURRENT_BODY_LINE = 0;
    LEFT_MARGIN = 0;
    TOP_MARGIN = 10;
    HEADER_IS_PRINTED = false;
    COLUMN_START = [];
    BODY_FINISH = false;
    TOT_PAGE = 0;
    DOCUMENT_FINISH = false;

    constructor(private electron: ElectronService,
                private ls: LocalStorageService,
                private gb: GlobalService,
                private log: LoggerService,
                private rechnung: RechnungService,
                private lieferschein: LieferscheinService,
                private proformaRechnung: ProformaRechnungService,
                private gutschrift: GutschriftService,
                private auftragsbestaetigung: AuftragsbestaetigungService,
                private bestellung: BestellungService) {
    }


    public print(csvData = []) {
        const type = this.gb.checkDocType(csvData);
        switch (type) {
            case 'RECHNUNG':
            case 'RECHNUNG KOPIE':
            case 'RECHNUNG DUPLIKAT':
            case 'FACTURE':
            case 'INVOICE': {
                this.docClass = this.rechnung.generate(csvData, type);
                break;
            }
            case 'LIEFERSCHEIN':
            case 'LIEFERSCHEIN KOPIE':
            case 'LIEFERSCHEIN DUPLIKAT':
            case 'BON DE LIVRAISON':
            case 'DELIVERY NOTE': {
                this.docClass = this.lieferschein.generate(csvData, type);
                break;
            }
            case 'PROFORMA RECHNUNG': {
                this.docClass = this.proformaRechnung.generate(csvData, type);
                break;
            }
            case 'GUTSCHRIFT':
            case 'AVOIR':
            case 'CREDIT NOTE': {
                this.docClass = this.gutschrift.generate(csvData, type);
                break;
            }
            case 'AUFTRAGSBESTÄTIGUNG':
            case 'ORDER CONFIRMATION':
            case 'CONFIRMATION DE COMMANDE': {
                this.docClass = this.auftragsbestaetigung.generate(csvData, type);
                break;
            }
            case 'BESTELLUNG':
            case 'BESTELLUNG-ÄNDERUNG': {
                this.docClass = this.bestellung.generate(csvData, type);
                break;
            }
            case 'ANFRAGE': {
                this.docClass = this.bestellung.generate(csvData, type);
                break;
            }
            default: {
                this.electron.remote.dialog.showErrorBox('Print Error',
                    'No template found for the document you are trying to print was found');
            }
        }

        this.log.info(this.docClass);

        this.paper = new jsPDF({filters: ['ASCIIHexEncode']});
        let totLine = this.docClass.docHeadingDetail.detail.length +
            this.docClass.docHeadingDetail.yourContact.length +
            this.docClass.tableFooter.length +
            this.docClass.documentFooter.length;

        this.docClass.tableRow.forEach((item => {
            totLine++;
            totLine += item.col2.otherDetail.length;
        }));

        this.TOT_PAGE = Math.ceil(totLine / this.DEFAULT_MAX_BODY_LINE);

        this.DOCUMENT_FINISH = false;
        this.HEADER_IS_PRINTED = false;
        this.PAGE_NUMBER = 1;
        this.CURRENT_BODY_LINE = 0;
        this.CURRENT_BODY_OFFSET = 95;
        this.MAX_BODY_LINE = this.DEFAULT_MAX_BODY_LINE;
        this.COLUMN_START = [];

        this.drawHeadedPaper();
        this.drawHeading();
        this.drawTableHeader();
        this.drawTableBody();
        this.drawTableFooter();
        this.drawDocumentFooter();
        this.printPreviewPDF(this.paper.output(), this.docClass.docType + '_' + this.docClass.documentNumber.description);
    }

    drawHeading() {
        this.paper.setFontSize(10);
        let currentHeadingLine = 45;
        this.docClass.heading.forEach((row) => {
            this.paper.text(row, this.LEFT_MARGIN + 18, this.TOP_MARGIN + currentHeadingLine);
            currentHeadingLine += this.SLUG;
        });
        this.paper.setFontSize(15);
        this.paper.setFontStyle('bold');
        this.paper.text(this.docClass.docType, this.LEFT_MARGIN + 10, this.TOP_MARGIN + 90);
        this.paper.setFontSize(10);

        this.paper.setFontStyle('bold');
        this.paper.text(this.docClass.documentDate.title, this.LEFT_MARGIN + 170, this.TOP_MARGIN + 60);
        this.paper.setFontStyle('normal');
        this.paper.text(this.docClass.documentDate.description, this.LEFT_MARGIN + 170, this.TOP_MARGIN + 60 + this.SLUG);

        this.paper.setFontStyle('bold');
        this.paper.text(this.docClass.documentNumber.title, this.LEFT_MARGIN + 170, this.TOP_MARGIN + 70);
        this.paper.setFontStyle('normal');
        this.paper.text(this.docClass.documentNumber.description, this.LEFT_MARGIN + 170, this.TOP_MARGIN + 70 + this.SLUG);

        this.paper.setFontStyle('bold');
        this.paper.text(this.docClass.dh1.title, this.LEFT_MARGIN + 170, this.TOP_MARGIN + 80);
        this.paper.setFontStyle('normal');
        this.paper.text(this.docClass.dh1.description, this.LEFT_MARGIN + 170, this.TOP_MARGIN + 80 + this.SLUG);

        this.paper.setFontStyle('bold');
        this.paper.text(this.docClass.dh2.title, this.LEFT_MARGIN + 135, this.TOP_MARGIN + 60);
        this.paper.setFontStyle('normal');
        this.paper.text(this.docClass.dh2.description, this.LEFT_MARGIN + 135, this.TOP_MARGIN + 60 + this.SLUG);

        this.paper.setFontStyle('bold');
        this.paper.text(this.docClass.dh3.title, this.LEFT_MARGIN + 135, this.TOP_MARGIN + 70);
        this.paper.setFontStyle('normal');
        this.paper.text(this.docClass.dh3.description, this.LEFT_MARGIN + 135, this.TOP_MARGIN + 70 + this.SLUG);

        this.paper.setFontStyle('bold');
        this.paper.text(this.docClass.dh4.title, this.LEFT_MARGIN + 135, this.TOP_MARGIN + 80);
        this.paper.setFontStyle('normal');
        this.paper.text(this.docClass.dh4.description, this.LEFT_MARGIN + 135, this.TOP_MARGIN + 80 + this.SLUG);

        this.paper.setFontStyle('bold');
        this.paper.text(this.docClass.dh5.title, this.LEFT_MARGIN + 100, this.TOP_MARGIN + 60);
        this.paper.setFontStyle('normal');
        this.paper.text(this.docClass.dh5.description, this.LEFT_MARGIN + 100, this.TOP_MARGIN + 60 + this.SLUG);

        this.paper.setFontStyle('bold');
        this.paper.text(this.docClass.dh6.title, this.LEFT_MARGIN + 100, this.TOP_MARGIN + 70);
        this.paper.setFontStyle('normal');
        this.paper.text(this.docClass.dh6.description, this.LEFT_MARGIN + 100, this.TOP_MARGIN + 70 + this.SLUG);

        this.paper.setFontStyle('bold');
        this.paper.text(this.docClass.dh7.title, this.LEFT_MARGIN + 100, this.TOP_MARGIN + 80);
        this.paper.setFontStyle('normal');
        this.paper.text(this.docClass.dh7.description, this.LEFT_MARGIN + 100, this.TOP_MARGIN + 80 + this.SLUG);

        if (!this.HEADER_IS_PRINTED) {
            this.docClass.docHeadingDetail.yourContact.push(this.docClass.docHeadingDetail.youContactLastLine);
            let maxArray = [];
            let minArray = [];
            let firstX: number;
            let secondX: number;
            if (this.docClass.docHeadingDetail.yourContact.length > this.docClass.docHeadingDetail.ourContact.length) {
                maxArray = this.docClass.docHeadingDetail.yourContact;
                minArray = this.docClass.docHeadingDetail.ourContact;
                firstX = 10;
                secondX = 130;
            } else {
                maxArray = this.docClass.docHeadingDetail.ourContact;
                minArray = this.docClass.docHeadingDetail.yourContact;
                firstX = 130;
                secondX = 10;
            }
            for (let idx = 0; idx !== maxArray.length; idx++) {
                if (minArray[idx]) {
                    this.writeLine(minArray[idx], secondX, 7, false);
                }
                if (maxArray[idx]) {
                    this.writeLine(maxArray[idx], firstX, 7, true);
                }
            }
            this.addNewLine();
            this.docClass.docHeadingDetail.detail.forEach((value) => {
                this.writeLine(value, firstX, 8);
            });
            this.HEADER_IS_PRINTED = true;
        }
    }

    drawTableBody() {
        this.BODY_FINISH = false;
        this.paper.setFontStyle('normal');
        this.paper.setFontSize(7);
        this.docClass.tableRow.forEach((bodyRow) => {
            if (this.COLUMN_START[0]) {
                this.paper.text(bodyRow.col1, this.COLUMN_START[0], this.TOP_MARGIN + this.CURRENT_BODY_OFFSET);
            }
            if (this.COLUMN_START[1]) {
                this.paper.setFontStyle('bold');
                this.paper.text(bodyRow.col2.rowDescription, this.COLUMN_START[1], this.TOP_MARGIN + this.CURRENT_BODY_OFFSET);
                this.paper.setFontStyle('normal');
            }
            if (this.COLUMN_START[2]) {
                this.paper.text(bodyRow.col3, this.COLUMN_START[2], this.TOP_MARGIN + this.CURRENT_BODY_OFFSET);
            }
            if (this.COLUMN_START[3]) {
                this.paper.text(bodyRow.col4, this.COLUMN_START[3], this.TOP_MARGIN + this.CURRENT_BODY_OFFSET);
            }
            if (this.COLUMN_START[4]) {
                this.paper.text(bodyRow.col5, this.COLUMN_START[4], this.TOP_MARGIN + this.CURRENT_BODY_OFFSET);
            }
            if (this.COLUMN_START[5]) {
                this.paper.text(bodyRow.col6, this.COLUMN_START[5], this.TOP_MARGIN + this.CURRENT_BODY_OFFSET);
            }
            if (this.COLUMN_START[6]) {
                this.paper.text(bodyRow.col7, this.COLUMN_START[this.COLUMN_START.length - 1] +
                    this.paper.getTextWidth(this.docClass.tableHeading[this.docClass.tableHeading.length - 1]),
                    this.TOP_MARGIN + this.CURRENT_BODY_OFFSET, {align: 'right'});
            }

            bodyRow.otherItemDetail.forEach((oitm) => {
                this.addNewLine();
                this.paper.text(oitm.title + ' ' + oitm.description,
                    this.COLUMN_START[this.COLUMN_START.length - 1] +
                    this.paper.getTextWidth(this.docClass.tableHeading[this.docClass.tableHeading.length - 1]),
                    this.TOP_MARGIN + this.CURRENT_BODY_OFFSET, {align: 'right'});
            });

            this.addNewLine();
            if (bodyRow.col2.priceDetailValue.length > 0) {
                this.paper.setFontStyle('bold');
                this.paper.text(bodyRow.col2.priceDetailDescription + ' ' + bodyRow.col2.priceDetailValue,
                    this.COLUMN_START[this.COLUMN_START.length - 1] +
                    this.paper.getTextWidth(this.docClass.tableHeading[this.docClass.tableHeading.length - 1]),
                    this.TOP_MARGIN + this.CURRENT_BODY_OFFSET, {align: 'right'});
                this.paper.setFontStyle('normal');
            }
            bodyRow.col2.otherDetail.forEach((row) => {
                this.writeLine(row, 20, 7);
            });
            if (bodyRow.lastLine.length > 0) {
                this.writeLine(bodyRow.lastLine, 20, 7);
            }
        });
        this.BODY_FINISH = true;
    }

    drawTableFooter() {
        this.addNewLine();
        this.paper.setFontSize(8);
        this.paper.line(10, this.TOP_MARGIN + this.CURRENT_BODY_OFFSET - 4.5, 200, this.TOP_MARGIN + this.CURRENT_BODY_OFFSET - 4.5);
        this.docClass.tableFooter.forEach((footerRow) => {
            this.paper.text(footerRow.col1, this.COLUMN_START[2], this.TOP_MARGIN + this.CURRENT_BODY_OFFSET);
            this.paper.text(footerRow.col2 + ((footerRow.col2.length > 0) ? '%' : ''),
                this.COLUMN_START[this.COLUMN_START.length - 1] - this.paper.getTextWidth(footerRow.col3.trim())
                - this.paper.getTextWidth(footerRow.col2.trim()), this.TOP_MARGIN + this.CURRENT_BODY_OFFSET);

            this.paper.setFontStyle('bold');
            this.paper.text(this.gb.currencyFormatDE(footerRow.col3), this.COLUMN_START[this.COLUMN_START.length - 1] +
                this.paper.getTextWidth(this.docClass.tableHeading[this.docClass.tableHeading.length - 1]),
                this.TOP_MARGIN + this.CURRENT_BODY_OFFSET, {align: 'right'});
            this.paper.setFontStyle('normal');

            this.addNewLine();
        });

    }

    drawTableHeader() {
        this.addNewLine(1);
        let currTab = 130;
        this.paper.setFontStyle('bold');
        this.paper.setFontSize(7);
        this.docClass.tableHeading.forEach((title, index) => {
            switch (index) {
                case 0: {
                    this.paper.text(title, 10, this.TOP_MARGIN + this.CURRENT_BODY_OFFSET);
                    this.COLUMN_START.push(10);
                    break;
                }
                case 1: {
                    this.paper.text(title, 20, this.TOP_MARGIN + this.CURRENT_BODY_OFFSET);
                    this.COLUMN_START.push(20);
                    break;
                }
                default: {
                    this.COLUMN_START.push(currTab);
                    const txt = title;
                    if (index === 16) {
                        this.paper.text(txt, currTab + this.paper.getTextWidth(txt), this.TOP_MARGIN + this.CURRENT_BODY_OFFSET,
                            {align: 'right'});
                    } else {
                        this.paper.text(txt, currTab, this.TOP_MARGIN + this.CURRENT_BODY_OFFSET);
                    }
                    currTab += this.paper.getTextWidth(txt) + 5;
                    break;
                }
            }
        });
        this.paper.setFontStyle('normal');
        this.paper.line(10, this.TOP_MARGIN + this.CURRENT_BODY_OFFSET + 2, 200, this.TOP_MARGIN + this.CURRENT_BODY_OFFSET + 2);
        this.paper.line(10, this.TOP_MARGIN + this.CURRENT_BODY_OFFSET - 4.5, 200, this.TOP_MARGIN + this.CURRENT_BODY_OFFSET - 4.5);
        this.addNewLine(2);
    }

    drawDocumentFooter() {
        this.docClass.documentFooter.forEach((item) => {
            this.writeLine(item, 10, 9);
        });
        this.writeLine(this.docClass.lastLine, 10);
        this.DOCUMENT_FINISH = false;
    }

    drawHeadedPaper() {
        const imageZZ = 'data:image/png;base64,' + logoData[0]['logozz'];
        const imageCT = 'data:image/png;base64,' + logoData[0]['logoct'];
        this.paper.addImage(imageZZ, 'JPEG', 100, 1, 100, 54);
        this.paper.setLineWidth(0.2);
        this.paper.setFontSize(7);
        this.paper.text('ZZ-DriveTech GmbH, An der Tagweide 12, 76139 Karlsruhe', this.LEFT_MARGIN + 10, this.TOP_MARGIN + 35);
        this.paper.setFontStyle('normal');
        this.paper.setFontSize(7);
        this.paper.setFont('courier');
        this.paper.addImage(imageCT, 'JPEG', 10, 269, 23, 26);
        this.paper.text('ME = Mengeneinheit: ST = Stück; g = Gramm; kg = Kilogramm    PE = Preiseinheit: 0=1 Stück; 1=pro 10; ' +
            '2=pro 100; 3=pro 1000', 10, 266);
        this.paper.line(8, 268, 203, 268);
        this.paper.setFontStyle('normal');
        this.paper.setFontSize(7);
        this.paper.text('build(' + this.electron.remote.app.getVersion() + ')', 120, 289);
        this.paper.text('Made by CTGROUP IT Department', 120, 293);
        this.paper.setFontStyle('bold');
        this.paper.setFontSize(9);
        this.paper.text('Page ' + this.PAGE_NUMBER + ' of ' + this.TOT_PAGE, 182, 293);
        this.paper.setFontStyle('normal');
        this.paper.setFontSize(7);

        this.paper.text('ZZ Drive Tech GmbH', 45, 272);
        this.paper.text('An der Tagweide 12', 45, 275);
        this.paper.text('76139 Karlsruhe', 45, 278);
        this.paper.text('Sitz der Gesellschaft Karlsruhe', 45, 281);
        this.paper.text('Registergericht: AG Mannheim HRB 721742', 45, 284);
        this.paper.text('Geschäftsführer: Pasqualino Di Matteo', 45, 287);
        this.paper.text('Ust-IdNr.: DE815609203', 45, 290);
        this.paper.text('St.-Nr.: 35009/07754', 45, 293);
        this.paper.text('Tel. +49 (0)721/6205-0', 120, 272);
        this.paper.text('Fax +49 (0)721/6205-10', 120, 275);
        this.paper.text('info@zzdrivetech.com', 120, 278);
        this.paper.text('www.zzdrivetech.com', 120, 281);

        this.paper.text('UniCredit Bank AG', 160, 272);
        this.paper.text('IBAN: DE81660202860022616510', 160, 275);
        this.paper.text('BIC: HYVEDEMM475', 160, 278);
    }

    writeLine(tx: string, x: number, fontSize: number = 10, NewLine: boolean = true) {
        if (tx.substr(0, 2) === '-B') {
            this.paper.setFontStyle('bold');
        } else {
            this.paper.setFontStyle('normal');
        }
        this.paper.setFontSize(fontSize);
        tx = tx.replace('-B', '');
        this.paper.text(tx, this.LEFT_MARGIN + x, this.TOP_MARGIN + this.CURRENT_BODY_OFFSET);
        if (NewLine) {
            this.addNewLine();
        }
    }

    writeColumn(tx: string, x: number, fontSize: number = 10) {
        if (tx.substr(0, 2) === '-B') {
            this.paper.setFontStyle('bold');
        } else {
            this.paper.setFontStyle('normal');
        }
        this.paper.setFontSize(fontSize);
        tx = tx.replace('-B', '');
        this.paper.text(tx, this.LEFT_MARGIN + x, this.TOP_MARGIN + this.CURRENT_BODY_OFFSET);
    }

    addNewLine(numeroLinee: number = 1) {
        for (let _i = 0; _i < numeroLinee; _i++) {
            this.CURRENT_BODY_OFFSET += this.SLUG;
            this.CURRENT_BODY_LINE++;
            if (this.CURRENT_BODY_LINE >= this.MAX_BODY_LINE) {
                this.newPage();
            }
        }
    }

    newPage() {
        if (!this.DOCUMENT_FINISH) {
            this.paper.addPage();
            this.paper.setFont('courier');
            this.PAGE_NUMBER++;
            this.CURRENT_BODY_LINE = 0;
            this.CURRENT_BODY_OFFSET = 95;
            this.MAX_BODY_LINE = this.DEFAULT_MAX_BODY_LINE;
            this.drawHeadedPaper();

            this.drawHeading();
            if (!this.BODY_FINISH) {
                this.drawTableHeader();
            }
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
            fileName = path.join(historyPath, this.gb.deUmlaut(nomeFile) + '_' + counter.toString() + '.pdf');
            if (this.electron.fs.existsSync(fileName)) {
                this.electron.fs.unlinkSync(fileName);
            }
            this.electron.fs.writeFileSync(fileName, pdfSrc);
            // console.log('APRO IL FILE');

            this.electron.childProcess.exec(this.gb.getCommandLine() + '"' + fileName + '"', (error, stdout, stderr) => {
                if (error) {
                    // const options = {
                    //     type: 'error',
                    //     buttons: ['OK'],
                    //     title: 'exec error',
                    //     message: stdout + '\n' + stderr
                    // };
                    // this.electron.remote.dialog.showMessageBox(null, options);
                    console.log(error);
                    return;
                } else {
                    // this.electron.remote.getCurrentWindow().reload();
                }
            });
        } catch (err) {
            // const options = {
            //     type: 'error',
            //     buttons: ['OK'],
            //     title: 'exec error',
            //     message: err.toString()
            // };
            // this.electron.remote.dialog.showMessageBox(null, options);
            console.log(err);
            return;
        }
    }

}
