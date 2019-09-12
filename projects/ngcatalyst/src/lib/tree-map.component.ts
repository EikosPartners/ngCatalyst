import { Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, AfterViewChecked } from '@angular/core';
import * as d3 from 'd3';
import { isEqual } from 'lodash';

@Component({
  selector: 'eikos-sunburst',
  template: `
  <h2>{{title}}</h2>
  <div [ngStyle]="area" >
      <div [id]="propID" style="width:100%;height:100%"> </div>
  </div>
`
})
export class TreeMapComponent implements OnInit, OnChanges, AfterViewInit, AfterViewChecked {

  @Input() propID = 'burst';
  @Input() data: [{name: string, children: [{name: string, size: number}, {name: string, children: []}]}];
  @Input() title: string;
  @Input() divHeight: any = "100%";
  @Input() divWidth: any = "100%";

  constructor() {
    window.addEventListener('resize', this.draw.bind(this));
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
  // you might need a method like this to reformat given data with the appropriate field names,
  // get dataModel() {
  //   return this.data.map(item => {
  //     return {date: item.something, value: item.somethingElse};
  //   });
  // }

  ngOnInit() {
    // this.drawSunburst();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && !changes.data.firstChange && !isEqual(changes.data.previousValue, changes.data.currentValue)) {
      this.draw();
    }
  }

  ngAfterViewInit() {
    this.draw();
  }

  ngAfterViewChecked() {
    this.draw();
  }

  draw() {
        // let localThis = this;

  }
}
