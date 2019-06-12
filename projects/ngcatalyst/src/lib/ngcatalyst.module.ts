import { NgModule } from '@angular/core';
import { NgcatalystComponent } from './ngcatalyst.component';
import { BarChartComponent } from './bar-chart.component';
import { BubbleChartComponent } from './bubble-chart.component';
import { LinePlotComponent } from './line-plot.component';

@NgModule({
  declarations: [NgcatalystComponent, BarChartComponent, BubbleChartComponent, LinePlotComponent],
  imports: [
  ],
  exports: [NgcatalystComponent, BarChartComponent, BubbleChartComponent, LinePlotComponent]
})
export class NgcatalystModule { }
