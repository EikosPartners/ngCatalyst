import { NgModule } from '@angular/core';
import { NgcatalystComponent } from './ngcatalyst.component';
import { BarChartComponent } from './bar-chart.component';
import { BubbleChartComponent } from './bubble-chart.component';

@NgModule({
  declarations: [NgcatalystComponent, BarChartComponent, BubbleChartComponent],
  imports: [
  ],
  exports: [NgcatalystComponent, BarChartComponent, BubbleChartComponent]
})
export class NgcatalystModule { }
