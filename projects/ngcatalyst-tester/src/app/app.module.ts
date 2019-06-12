import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { PunchCardComponent } from 'ngcatalyst';

@NgModule({
  declarations: [
    AppComponent,
    PunchCardComponent
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
