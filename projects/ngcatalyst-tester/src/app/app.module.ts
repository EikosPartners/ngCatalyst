import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
// import { SunburstComponent, PunchCardComponent, PieChartComponent, LinePlotComponent, HeatMapComponent, BubbleChartComponent, BarChartComponent } from 'ngcatalyst';
// import {NgcatalystModule} from 'ngcatalyst';
import {CardListComponent} from '../../../../projects/ngcatalyst/src/lib/card-list/card-list.component';

@NgModule({
  declarations: [
    AppComponent,
    CardListComponent
  ],
  imports: [
    BrowserModule,
    // NgcatalystModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
