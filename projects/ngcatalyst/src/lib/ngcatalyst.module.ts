import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { NgcatalystComponent } from './ngcatalyst.component';
import { BarChartComponent } from './bar-chart.component';
import { BubbleChartComponent } from './bubble-chart.component';
import { LinePlotComponent } from './line-plot.component';
import { PieChartComponent } from './pie-chart.component';
import { PunchCardComponent } from './punch-card.component';
import { SunburstComponent } from './sunburst.component';
import { HeatMapComponent } from './heat-map.component';
import { ResizeObserverDirective } from './resize-observer.directive';

import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    NgcatalystComponent, BarChartComponent, BubbleChartComponent, LinePlotComponent, PieChartComponent, PunchCardComponent, SunburstComponent, HeatMapComponent,
    ResizeObserverDirective
  ],
  imports: [
    CommonModule, BrowserModule
  ],
  exports: [
    NgcatalystComponent,
    BarChartComponent, BubbleChartComponent, LinePlotComponent, PieChartComponent, PunchCardComponent, SunburstComponent, HeatMapComponent]
})
export class NgcatalystModule { }
