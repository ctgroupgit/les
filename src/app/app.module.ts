import 'reflect-metadata';
import '../polyfills';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule, NgZone} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule, HttpClient} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {ElectronService} from './providers/electron.service';

import {WebviewDirective} from './directives/webview.directive';

import {AppComponent} from './app.component';
import {HomeComponent} from './components/home/home.component';


import {AngularFontAwesomeModule} from 'angular-font-awesome';
import {SockService} from './providers/sock.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxWebstorageModule} from 'ngx-webstorage';
import {PreferencesComponent} from './components/preferences/preferences.component';
import {
    MatButtonModule, MatCardModule, MatFormFieldModule, MatGridListModule,
    MatIconModule, MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule, MatSliderModule, MatSlideToggleModule,
    MatTableModule, MatTabsModule,
    MatToolbarModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {LoggerService} from './providers/logger.service';
import {ConsoleLoggerService} from './providers/console-logger.service';


// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        PreferencesComponent,
        WebviewDirective,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        AngularFontAwesomeModule,
        BrowserAnimationsModule,
        NgxWebstorageModule.forRoot(),
        MatListModule,
        MatTableModule,
        MatButtonModule,
        MatSidenavModule,
        MatMenuModule,
        MatIconModule,
        MatToolbarModule,
        FlexLayoutModule,
        MatGridListModule,
        MatFormFieldModule,
        MatInputModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatCardModule,
        MatTabsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (HttpLoaderFactory),
                deps: [HttpClient]
            }
        }),
    ],
    providers: [ElectronService, SockService, {provide: LoggerService, useClass: ConsoleLoggerService}],
    bootstrap: [AppComponent]
})
export class AppModule {
}
