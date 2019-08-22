import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'eikos-tree-map',
  template: `
<h2>{{title}}</h2>
<div [ngStyle]="area">
    <div [id]="propID" style="width:100%;height:100%"> </div>
</div>
  `
})
export class TreeMapComponent implements OnChanges, AfterViewInit {
  @Output() clickEvent = new EventEmitter<any>();
  @Input() propID = 'tree-map';
  @Input() title = "Tree Map";
  @Input() data = [{}]; // {x: String, y: String, magnitude: Number} || {date: String, volume: Number} - can use dataModel getter/computer to reformat as needed
  @Input() colors = ["#081A4E", "#092369", "#1A649F", "#2485B4", "#2DA8C9", "#5DC1D0", "#9AD5CD", "#D5E9CB", "#64B5F6", "#01579B"]; // need 10 hex colors;
  @Input() divHeight: any = "100%";
  @Input() divWidth: any = "100%";

  constructor() {
  }

  get area () {
    let height, width;
    if (typeof this.divHeight === "number") {
      height = this.divHeight + "px";
    } else {
      height = this.divHeight;
    }
    if (typeof this.divWidth === "number" ) {
      width = this.divWidth + "px";
    } else {
      width = this.divWidth;
    }
    return {height: height, width: width};
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && changes.data.previousValue) {
      this.draw();
    } else if (changes.colors && changes.colors.previousValue) {
      this.draw();
    }
  }

  ngAfterViewInit() {
    this.draw();
  }

  draw () {

  }

}