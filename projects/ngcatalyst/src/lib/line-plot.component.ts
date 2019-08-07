import { Component, OnInit, Input, OnChanges, DoCheck, SimpleChanges, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { isEqual } from 'lodash';

@Component({
  selector: 'eikos-line-plot',
  template: `
  <h2>{{title}}</h2>
  <div [ngStyle]="area" >
      <div  [id]="propID" style="width:100%;height:100%"> </div>
  </div>
`
})

export class LinePlotComponent implements DoCheck, OnInit, OnChanges, AfterViewInit {

  @Input() propID = 'line';
  @Input() data: [{date: string, value: number}];
  @Input() title: "Line Plot";
  @Input() color = "#000";
  @Input() yAxisLabel = 'Value';
  @Input() xAxisLabel = 'Date';
  @Input() divHeight: any = "100%"; // for a % you need a container div with a non-% height and width;
  @Input() divWidth: any = "100%";
  @Input() axisFontSize: any = "14px";
  @Input() margins = { top: 20, right: 30, bottom: 45, left: 50 };
  // gradientId = 'gradient-' + this.propID;

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
    // this.drawLinePlot(this.data, "#" + this.propID, this.color);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.propID);
    if (!changes.data.firstChange && !isEqual(changes.data.previousValue, changes.data.currentValue)) {
      this.drawLinePlot();
    }
    // else if (isEqual(changes.data.previousValue, changes.data.currentValue)) {
    //   debugger;
    // }
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
    const x = d3.scaleTime().range([0, width]).domain(d3.extent(data, xValue)).nice();
    const y = d3.scaleLinear().range([height, 0]).domain(d3.extent(data, yValue)).nice();
    // x;
    // y.;


    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", `d3_visuals_tooltip ${this.propID}_tooltip`)
        .style("opacity", 0);

    const yAxis = d3.axisLeft()
        .tickSizeInner(-width)
        .scale(y),
      xAxis = d3.axisBottom()
        .tickSizeInner(-height)
        .tickFormat(d3.timeFormat('%b'))
        .scale(x),
      line = d3.line()
        .curve(d3.curveLinear)
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); }),
      svg = d3
        .select(selection_string)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("linearGradient")
        .attr("id", "gradient-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", y(0))
        .attr("x2", 0).attr("y2", y(1))
      .selectAll("stop")
        .data([
          {offset: "0%", color: "red"},
          {offset: "50%", color: "green"}
        ])
      .enter().append("stop")
        .attr("offset", function(d) {
          debugger
          return d.offset; })
        .attr("stop-color", function(d) { return d.color; });

    svg.append("g")
        .attr("class", "x axis x-axis")
        .style('fill', 'grey')
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("x", (width / 2))
        .attr("y", 25)
        .attr("dy", ".71em")
        .style("fill", "black")
        .style("text-anchor", "middle")
        .attr("font-size", this.axisFontSize)
        .text(this.xAxisLabel);

    svg.append("g")
        .attr("class", "y axis y-axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("fill", "black")
        .attr("font-size", this.axisFontSize)
        .text(this.yAxisLabel);
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    const xMap = function(d) {return  x(xValue(d)); };
    const yMap = function(d) {return  y(yValue(d)); };
    const clip_id = "clip-" + this.propID;

    // const detected_percent =
    //   d3.max(data, function(d) {
    //     return d.value;
    //   }) <= 1
    //     ? true
    //     : false;
    // let format_attribute;

    //   if (detected_percent) {
    //     format_attribute = d3.format("%");
    //   } else {
    //     format_attribute = d3.format("");
    //   }

    svg
        .selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .attr("clip-path", "url(#" + clip_id + ")")
        .attr("fill", "black")
        .attr("opacity", 0)
        .on("mouseover", function(d) {
          tooltip
            .transition()
            .duration(100)
            .style("opacity", 1);
          tooltip
            .html(
              "Date: " + formatDate(d.date) +
                "<br>" +
                localThis.yAxisLabel +
                ": " +
                (yValue(d))
            )
            .style("left", d3.event.pageX + 5 + "px")
            .style("top", d3.event.pageY - 28 + "px");
          d3
            .select(this)
            .transition()
            .duration(50)
            .style("fill", "black")
            .attr("opacity", 1);

        })
        .on("mouseout", function(d) {
          tooltip
            .transition()
            .duration(300)
            .style("opacity", 0);
          d3
            .select(this)
            .transition()
            .duration(50)
            .attr("opacity", 0);
        });
  }

}
