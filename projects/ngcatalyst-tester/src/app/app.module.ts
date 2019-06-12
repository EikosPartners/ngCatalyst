import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {PieChartComponent} from 'ngcatalyst';

@NgModule({
  declarations: [
    AppComponent,
    PieChartComponent
    // LinePlotComponent
    // BubbleChartComponent
    // BarChartComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
