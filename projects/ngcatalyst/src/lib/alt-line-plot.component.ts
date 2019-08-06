import { Component, OnInit, Input, OnChanges, DoCheck, SimpleChanges, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { isEqual } from 'lodash';

@Component({
  selector: 'eikos-line-plot-alt',
  template: `
  <h2>{{title}}</h2>
  <div [ngStyle]="area" >
      <div [id]="propID" style="width:100%;height:100%"> </div>
  </div>
`
})

export class AltLinePlotComponent implements DoCheck, OnInit, OnChanges, AfterViewInit {

  @Input() propID = 'lineagain';
  @Input() data: [{date: string, value: number}];
  @Input() title: "Line Plot 2";
  @Input() color = "#000";
  @Input() yAxisLabel = 'Value';
  @Input() xAxisLabel = 'Date';
  @Input() divHeight: any = "100%"; // for a % you need a container div with a non-% height and width;
  @Input() divWidth: any = "100%";
  @Input() axisFontSize: any = "14px";
  @Input() margins = { top: 20, right: 30, bottom: 45, left: 50 };
  // @Input() xAxisAngle = 45;
  // @Input() yAxisAngle = 45;

  constructor() { }

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
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.propID);
    if (!changes.data.firstChange && !isEqual(changes.data.previousValue, changes.data.currentValue)) {
      this.drawLinePlot();
    }

  }

  ngAfterViewInit() {
    this.drawLinePlot();
  }

  ngDoCheck() {
    console.log(this.propID, this.data);
  }

  drawLinePlot() {
    const localThis = this;
    const selection_string = "#" + this.propID, color = this.color;

    d3.selectAll(`.${this.propID}_tooltip`).remove();
    if (document.querySelectorAll(selection_string + " svg")[0] != null) {
      document.querySelectorAll(selection_string + " svg")[0].remove();
    }
    // make copy of the original data so we do not mutate it
    const data = [];
    // console.log(this.data)
    this.data.forEach(el => data.push(Object.assign({}, el)));

    const parseDate = d3.timeParse('%Y-%m-%d');
    const formatDate = d3.timeFormat('%B %-d %Y');
    // https://github.com/d3/d3-time-format to change how this is formatted - leave the parseDate because that's for sorting the data

    if (typeof data[0].date === 'string') {
      data.forEach(function(d) {
        d.date = parseDate(d.date);
      });
    }
    data.sort(function(a, b) {
      return a.date - b.date;
    });
    let element: any;

    const selected = document.querySelectorAll(selection_string);

    if (selected[0] == null) {
      element = [{clientWidth: 500, clientHeight: 500}];
    } else {
      element = selected[0];
    }
    const detected_percent =
      d3.max(data, function(d) {
        return d.value;
      }) <= 1
        ? true
        : false;
    const margin = this.margins,
      width = element.clientWidth - margin.left - margin.right;
    let height = element.clientHeight - margin.top - margin.bottom;

    // Account for panel heading height if the title exists.
    if (this.title) {
      height -= 40;
    }
    const xValue = function(d) {
      return d.date;
    };
    const yValue = function(d) {
      return d.value;
    };
    const x = d3.scaleTime().range([0, width - margin.right]);
    const y = d3.scaleLinear().range([height, 0]);

    const yAxis = d3.axisLeft()
        .scale(y),
      xAxis = d3.axisBottom()
        .scale(x);
    const line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });
   const svg = d3
        .select(selection_string)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(d3.extent(data, xValue)).nice();
    y.domain(d3.extent(data, yValue)).nice();
    svg.append("linearGradient")
    .attr("id", "gradient-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0).attr("y1", y(0))
    .attr("x2", 0).attr("y2", y(1))
  .selectAll("stop")
    .data([
      {offset: "0%", color: "steelblue"},
      {offset: "50%", color: "gray"},
      {offset: "100%", color: "red"}
    ])
  .enter().append("stop")
    .attr("offset", function(d) { return d.offset; })
    .attr("stop-color", function(d) { return d.color; });
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Units");
  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

  }

}
