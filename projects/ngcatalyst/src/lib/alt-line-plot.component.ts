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
    const xScale = d3.scaleTime().range([0, width - margin.right]).domain(d3.extent(data, xValue)).nice();
    const yScale = d3.scaleLinear().range([height, 0]).domain(d3.extent(data, yValue)).nice();

    const svg = d3
      .select(selection_string)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    const xAxis = d3.axisBottom()
      .scale(xScale)
      .tickSizeInner(-height)
      .ticks(6);
    const yAxis = d3.axisLeft()
        .scale(yScale);
    svg
      .append("g")
      .attr("class", "x axis xaxis axis-line-plot")
      .attr("transform", "translate(0," + height + ")")
      .style('fill', 'black')
      .style("font-size", "14px")
      .call(xAxis)
      .append("text")
      .attr("x", (width / 2))
      .attr("y", 25)
      .attr("dy", ".71em")
      .style("text-anchor", "middle")
      .attr("font-size", this.axisFontSize)
      .text(this.xAxisLabel);

    svg
      .append("g")
      .attr("class", "y axis yaxis axis-line-plot")
      .style("fill", "black")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .attr("font-size", this.axisFontSize)
      .text(this.yAxisLabel);

    const gradient = {id: "blahblahblah"};

    svg.append("linearGradient")
      .attr("id", "blahblahblah")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height)
    .selectAll("stop")
      .data([
        {offset: 0, color: "red"},
        {offset: yScale(d3.median(data, d => d.value)) / height, color: "red"},
        {offset: yScale(d3.median(data, d => d.value)) / height, color: "black"},
        {offset: 1, color: "black"}
      ])
    .join("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
    const xMap = function(d) {
      return xScale(xValue(d));
    };
    const yMap = function(d) {
      return yScale(yValue(d));
    };
    const line = d3.line()
      .x(xMap)
      .y(yMap)
      .curve(d3.curveLinear);

    svg.append("path")
    .datum(data)
    .attr("class", "line lineplotline")
    .attr("d", line)
    .attr("stroke-width", 3);



    /* .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);
*/
  }

}
