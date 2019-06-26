import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { SunburstComponent, PunchCardComponent, PieChartComponent, LinePlotComponent, HeatMapComponent, BubbleChartComponent, BarChartComponent } from 'ngcatalyst';

@NgModule({
  declarations: [
    AppComponent,
    SunburstComponent,
    PunchCardComponent,
    PieChartComponent,
    LinePlotComponent,
    HeatMapComponent,
    BubbleChartComponent,
    BarChartComponent,
  ],
  imports: [
    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
