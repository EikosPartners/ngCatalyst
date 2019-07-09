import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
// import { SunburstComponent, PunchCardComponent, PieChartComponent, LinePlotComponent, HeatMapComponent, BubbleChartComponent, BarChartComponent } from 'ngcatalyst';
import {NgcatalystModule} from 'ngcatalyst';
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    NgcatalystModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
