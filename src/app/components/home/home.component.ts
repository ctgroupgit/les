import {Component, OnInit, OnDestroy, AfterViewChecked, ChangeDetectorRef, ViewRef} from '@angular/core';
import {ElectronService} from '../../providers/electron.service';
import {SockService} from '../../providers/sock.service';
import {Subscription} from 'rxjs';
import {LocalStorageService} from 'ngx-webstorage';
import {MatTableDataSource} from '@angular/material';
import * as path from 'path';
import {PdfGenerationService} from '../../providers/pdf-generation.service';
import {rootPath} from 'electron-root-path';
import {isDevMode} from '@angular/core';
import {GlobalService} from '../../providers/global.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewChecked {

    public displayedColumns = ['order', 'name', 'pathFile'];
    public dataSource = new MatTableDataSource<string>();
    newFileBuffer: Subscription;


    constructor(private electron: ElectronService,
                private sock: SockService,
                private localStorage: LocalStorageService,
                private pdf: PdfGenerationService,
                private gb: GlobalService,
                private cd: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.newFileBuffer = this.sock.dati.subscribe((event) => {
            this.scanDir();
        });
    }

    ngOnDestroy() {
        this.newFileBuffer.unsubscribe();
    }

    ngAfterViewChecked() {
        if (!(this.cd as ViewRef).destroyed) {
            this.cd.detectChanges();
        }
    }

    public scanDir() {
        // console.log('SCAN DIR');
        const historyPath = path.join(this.electron.remote.app.getPath('appData'), this.electron.remote.app.getName(), 'history');
        if (!this.electron.fs.existsSync(historyPath)) {
            this.electron.fs.mkdirSync(historyPath);
        }
        const templateLists: any = [];
        this.electron.fs.readdirSync(historyPath).forEach((file) => {
            // console.log(file);
            templateLists.push({
                order: file.split('_').pop().replace('.pdf', ''),
                name: file.toString(),
                pathFile: path.join(historyPath, file)
            });
        });
        // console.log(templateLists);
        this.dataSource.data = templateLists.sort(function (obj1, obj2) {
            return obj2.order - obj1.order;
        });
    }

    public viewHistoryPdf(filePath: string) {
        this.electron.childProcess.exec(this.getCommandLine() + '"' + filePath['pathFile'] + '"', (error, stdout, stderr) => {
            if (error) {
                console.log(error);
                return;
            }
        });
    }

    getCommandLine() {
        switch (process.platform) {
            case 'darwin' :
                return 'open ';
            case 'win32' :
                return 'explorer ';
            default :
                return 'START ';
        }
    }
}

