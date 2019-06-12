import { NgModule } from '@angular/core';
import { NgcatalystComponent } from './ngcatalyst.component';
import { BarChartComponent } from './bar-chart.component';
import { BubbleChartComponent } from './bubble-chart.component';
import { LinePlotComponent } from './line-plot.component';
import { PieChartComponent } from './pie-chart.component';
import { PunchCardComponent } from './punch-card.component';
import { SunburstComponent } from './sunburst.component';

@NgModule({
  declarations: [NgcatalystComponent,
    BarChartComponent, BubbleChartComponent, LinePlotComponent, PieChartComponent, PunchCardComponent, SunburstComponent],
  imports: [
  ],
  exports: [NgcatalystComponent,
    BarChartComponent, BubbleChartComponent, LinePlotComponent, PieChartComponent, PunchCardComponent, SunburstComponent]
})
export class NgcatalystModule { }
