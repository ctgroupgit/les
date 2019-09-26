export class DocumentModel {
    heading: string[] = [];
    documentDate: FieldModel = new FieldModel();
    documentNumber: FieldModel = new FieldModel();
    dh1: FieldModel = new FieldModel();
    dh2: FieldModel = new FieldModel();
    dh3: FieldModel = new FieldModel();
    dh4: FieldModel = new FieldModel();
    dh5: FieldModel = new FieldModel();
    dh6: FieldModel = new FieldModel();
    dh7: FieldModel = new FieldModel();
    docType = '';
    docHeadingDetail: DocHeadingDetailModel = new DocHeadingDetailModel();
    tableType = '';
    tableHeading: string[] = [];
    tableRow: TableRowModel[] = [];
    tableFooter: TableFooterModel[] = [];
    lastLine = '';
    documentFooter: string[] = [];
}

export class DocHeadingDetailModel {
    yourContact: string[] = [];
    youContactLastLine = '';
    ourContact: string[] = [];
    detail: string[] = [];
}

export class TableRowModel {
    col1 = '';
    col2: TableRowDetailModel = new TableRowDetailModel();
    col3 = '';
    col4 = '';
    col5 = '';
    col6 = '';
    col7 = '';
    lastLine = '';
    otherItemDetail: FieldModel[] = [];
}

export class TableFooterModel {
    col1 = '';
    col2 = '';
    col3 = '';
}

export class TableRowDetailModel {
    rowDescription = '';
    priceDetailDescription = '';
    priceDetailValue = '';
    otherDetail: string[] = [];
}

export class FieldModel {
    title = '';
    description = '';
}
