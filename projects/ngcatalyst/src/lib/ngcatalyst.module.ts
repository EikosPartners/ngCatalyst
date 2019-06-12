import { NgModule } from '@angular/core';
import { NgcatalystComponent } from './ngcatalyst.component';
import { BarChartComponent } from './bar-chart.component';

@NgModule({
  declarations: [NgcatalystComponent, BarChartComponent],
  imports: [
  ],
  exports: [NgcatalystComponent, BarChartComponent]
})
export class NgcatalystModule { }
