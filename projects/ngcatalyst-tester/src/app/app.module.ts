import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SunburstComponent } from 'ngcatalyst';

@NgModule({
  declarations: [
    AppComponent,
    SunburstComponent
    // PunchCardComponent
    // PieChartComponent
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
