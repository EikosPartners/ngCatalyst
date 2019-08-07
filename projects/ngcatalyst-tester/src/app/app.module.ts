import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
// import {NgcatalystModule} from 'ngcatalyst';

import {LinePlotComponent} from '../../../../projects/ngcatalyst/src/lib/line-plot.component';
// import {BarChartComponent} from '../../../../projects/ngcatalyst/src/lib/bar-chart.component';
// import {SunburstComponent} from '../../../../projects/ngcatalyst/src/lib/sunburst.component';
// import {PieChartComponent} from '../../../../projects/ngcatalyst/src/lib/pie-chart.component';
// import {BubbleChartComponent} from '../../../../projects/ngcatalyst/src/lib/bubble-chart.component';
// import {HeatMapComponent} from '../../../../projects/ngcatalyst/src/lib/heat-map.component';
// import {PunchCardComponent} from '../../../../projects/ngcatalyst/src/lib/punch-card.component';

@NgModule({
  declarations: [
    AppComponent,
    // BarChartComponent,
    // SunburstComponent,
    LinePlotComponent
    // PieChartComponent,
    // HeatMapComponent,
    // BubbleChartComponent,
    // PunchCardComponent
  ],
  imports: [
    BrowserModule,
    // NgcatalystModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
