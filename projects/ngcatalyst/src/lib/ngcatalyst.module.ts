import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { NgcatalystComponent } from './ngcatalyst.component';
import { BarChartComponent } from './bar-chart.component';
import { BubbleChartComponent } from './bubble-chart.component';
import { LinePlotComponent } from './line-plot.component';
import { PieChartComponent } from './pie-chart.component';
import { PunchCardComponent } from './punch-card.component';
import { SunburstComponent } from './sunburst.component';
import { TreeMapComponent } from './tree-map.component';

import { HeatMapComponent } from './heat-map.component';

import { CardListComponent } from './card-list/card-list.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    NgcatalystComponent, BarChartComponent, BubbleChartComponent, LinePlotComponent, PieChartComponent, PunchCardComponent, SunburstComponent, HeatMapComponent, CardListComponent, TreeMapComponent],
  imports: [
    CommonModule, BrowserModule
  ],
  exports: [
    NgcatalystComponent,
    BarChartComponent, BubbleChartComponent, LinePlotComponent, PieChartComponent, PunchCardComponent, SunburstComponent, HeatMapComponent, CardListComponent, TreeMapComponent]
})
export class NgcatalystModule {
 }
