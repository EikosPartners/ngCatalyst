import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {BubbleChartComponent} from 'ngcatalyst';

@NgModule({
  declarations: [
    AppComponent,
    BubbleChartComponent
    // BarChartComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
