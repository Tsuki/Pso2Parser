import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
import {HomeComponent} from './components/home/home.component';
import {RecounterComponent} from './components/recounter/recounter.component';

import {AppRoutingModule} from './app-routing.module';

import {ElectronService} from './providers/electron.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material.module';
import {CdkTableModule} from '@angular/cdk';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RecounterComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    CdkTableModule
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
