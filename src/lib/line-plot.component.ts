import {
  AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input,
  OnChanges, Output, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren, ViewContainerRef
} from '@angular/core';
import * as d3 from 'd3';
import { isEqual, flatten } from 'lodash';

@Component({
  selector: 'eikos-line-plot',
  template: `
  <!--   <ng-container #vc></ng-container> -->
  <div [ngStyle]="area">
    <!-- <ng-template> -->
    <div [id]="propID" style="width:100%;height:100%"> </div>
  </div>
  <!-- </ng-template>-->
`
})

export class LinePlotComponent implements OnChanges, AfterViewInit, AfterViewChecked {
  @Output() clickEvent = new EventEmitter<any>();
  @Input() propID = 'line';
  @Input() data: Object; // {"line data label": [{date: string, value: number}]}
  @Input() colors = ["red", "green"];
  @Input() threshold = null;
  @Input() yAxisLabel = 'Value';
  @Input() xAxisLabel = 'Date';
  @Input() divHeight: any = "100%"; // for a % you need a container div with a non-% height and width;
  @Input() divWidth: any = "100%";
  @Input() axisFontSize: any = "14px";
  @Input() margins = { top: 20, right: 30, bottom: 60, left: 50 };
  @Input() type = "Date"; // (alternate option is time)
  givenHeight = this.divHeight;
  givenWidth = this.divWidth;
  @Input() xAxisAngle = 45;
  resized = false;
  @ViewChildren('c', { read: ElementRef }) childComps: QueryList<ElementRef>;
  @ViewChild('vc', { read: ViewContainerRef, static: false }) viewContainer: ViewContainerRef;
  @ViewChild(TemplateRef, {static: false}) template: TemplateRef<null>;
  @Input() dateTimeFormat: string; //the format of the date or time data in a Moment String
  @Input() axisLabelFormat: string; //the format the x axis label should be in a Moment String
  @Input() tooltipLabelFormat: string; //the format the tooltip should display the dat/time data in a Moment String
  dateTimeConversion: Object = {
    'HH:mm:ss': '%H:%M:%S',
    'H:mm:ss': '%H:%M:%S',
    'hh:mm:ss': '%I:%M:%S',
    'h:mm:ss': '%I:%M:%S',
    'hh:mm a': '%I:%M %p',
    'hh:mm:ss a': '%I:%M:%S %p',
    'h:mm:ss a': '%I:%M:%S %p',
    'MM/YYYY': '%m/%Y',
    'M/YYYY': '%m/%Y',
    'M/YY': '%m/%y',
    'MMM YYYY': '%b %Y',
    'MMM YY': '%b %y',
    'MM/DD/YY': '%m/%d/%y',
    'MM/DD/YYYY': '%m/%d/%Y',
    'MM-DD-YY': '%m-%d-%y',
    'MM-DD-YYYY': '%m-%d-%Y',
    'MMMM YYYY': '%B %Y',
    'MMMM YY': '%B %y',
    'M/DD/YY': '%m/%d/%y',
    'M/DD/YYYY': '%m/%d/%Y',
    'M-DD-YY': '%m-%d-%y',
    'M-DD-YYYY': '%m-%d-%Y',
    'M/D/YY': '%m/%e/%y',
    'M/D/YYYY': '%m/%e/%Y',
    'M-D-YY': '%m-%e-%y',
    'M-D-YYYY': '%m-%e-%Y',
    'MM/D/YY': '%m/%e/%y',
    'MM/D/YYYY': '%m/%e/%Y',
    'MM-D-YY': '%m-%e-%y',
    'MM-D-YYYY': '%m-%e-%Y',
    'YYYY-MM-DD': '%Y-%m-%d',
    'YYYY-DD-MM': '%Y-%d-%m',
    'D-MMM-YY': '%d-%b-%y',
    'MMMM': '%B',
    'MMM': '%b',
    'ddd': '%a',
    'dddd': '%A',
    'D/MM/YY': '%e/%m/%y',
    'D/MM/YYYY': '%e/%m/%Y',
    'D-MM-YY': '%e-%m-%y',
    'D-MM-YYYY': '%e-%m-%Y',
    'D/M/YY': '%e/%m/%y',
    'D/M/YYYY': '%e/%m/%Y',
    'D-M-YY': '%e-%m-%y',
    'D-M-YYYY': '%e-%m-%Y',
    'DD/M/YY': '%d/%m/%y',
    'DD/M/YYYY': '%d/%m/%Y',
    'DD-M-YY': '%d-%m-%y',
    'DD-M-YYYY': '%d-%m-%Y',
    'DD/MM/YY': '%d/%m/%y',
    'DD/MM/YYYY': '%d/%m/%Y',
    'DD-MM-YY': '%d-%m-%y',
    'DD-MM-YYYY': '%d-%m-%Y',
    'MMMM D': '%B %e',
    'MMM D': '%b %e',
    'M/D': '%m/%e',
    "MMM DD YYYY HH:mm:ss": '%b %d %Y %H:%M:%S',
    'DD MMM': '%d %b',
    'D MMM': '%e %b',
    'DD MMMM': '%d %B',
    'D MMMM': '%e %B'
  }

  constructor() {
    window.addEventListener('resize', this.drawLinePlot.bind(this));
  }

  get area() {
    let height, width;
    if (typeof this.divHeight === "number") {
      height = this.divHeight + "px";
    } else {
      height = this.divHeight;
    }
    if (typeof this.divWidth === "number") {
      width = this.divWidth + "px";
    } else {
      width = this.divWidth;
    }
    return { height, width };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.data.firstChange && !isEqual(changes.data.previousValue, changes.data.currentValue)) {
      this.drawLinePlot();
    }
  }

  ngAfterViewChecked() {
    const offsetHeight = document.querySelectorAll('#' + this.propID)[0]['offsetHeight'];
    const offsetWidth = document.querySelectorAll('#' + this.propID)[0]['offsetWidth'];
    if ((offsetHeight !== this.givenHeight || offsetWidth !== this.givenWidth) && this.resized === false) {
      this.givenHeight = offsetHeight;
      this.givenWidth = offsetWidth;
      this.drawLinePlot();
      this.resized = false;
    }
  }

  ngAfterViewInit() {
    this.drawLinePlot();
  }

  drawLinePlot() {
    const localThis = this;
    const selection_string = "#" + this.propID;
    const dataKey = localThis.type.toLowerCase();
    // remove previous chart and tooltips if already drawn on the page
    d3.selectAll(`.${this.propID}_tooltip`).remove();
    if (document.querySelectorAll(selection_string + " svg")[0] != null) {
      document.querySelectorAll(selection_string + " svg")[0].remove();
    }
    // make copy of the original data so we do not mutate it
    const data = {};
    for (let key in this.data) {
      const copy = this.data[key].map(dataPoint => {
        dataPoint = Object.assign({}, dataPoint);
        return dataPoint;
      })
      data[key] = copy;
    }

    // create parsers to format the data for display in graph
    const dateTimeParser = d3.timeParse(this.dateTimeConversion[this.dateTimeFormat])
    //create date/time formatter to format text on tooltip
    let formatDate;
    if (this.tooltipLabelFormat) {
      formatDate = d3.timeFormat(this.dateTimeConversion[this.tooltipLabelFormat]);
    } else {
      if (localThis.type === "Date") {
        formatDate = d3.timeFormat('%B %-d %Y');
      } else if (localThis.type === "Time") {
        formatDate = d3.timeFormat('%I:%M %p');
      }
    }
    
    // sort the data go through each key value pair for line and sorts the data array
    for (let key in data) {
      data[key].forEach(el => {
        el[dataKey] = dateTimeParser(el[dataKey]);
      })
      data[key] = data[key].sort(function (a, b) {
        return a[dataKey] - b[dataKey];
      });
    }
      
    let element: any;
    const selected = document.querySelectorAll(selection_string);

    if (selected[0] == null) {
      element = [{ clientWidth: 500, clientHeight: 500 }];
    } else {
      element = selected[0];
    }

    const margin = this.margins;
    const width = element.clientWidth - margin.left - margin.right;
    let height = element.clientHeight - margin.top - margin.bottom - (this.xAxisAngle ? 10 : 0);
    if (height < 0) {
      height = 300;
    }

    // create functions that will be used to process x and y values from the data
    const xValue = function (d) {
      return d[dataKey]
    };
    const yValue = function (d) {
      return d.value;
    };
    // this flattens all the arrays into one so that we can find the lowest/highest values for axes and properly scale
    const allDataPoints = flatten(Object.values(data));
    // create the scales for the data and axes. range is the how big the axes will be and domain is what the 
    // range of values will be for the axes.(this is calc by by finding min and max values of data points)
    const x = d3.scaleTime().range([0, width]).domain(d3.extent(allDataPoints, xValue)).nice();
    const y = d3.scaleLinear().range([height, 0]).domain(d3.extent(allDataPoints, yValue)).nice();

    // add tooltip to the DOM for the chart
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", `d3_visuals_tooltip ${this.propID}_tooltip`)
      .style("opacity", 0);

    // format for x axis labels based on date or time, will be used to process raw data to readable dates/times
    let timeFormatLabel;
    if (localThis.axisLabelFormat) {
      timeFormatLabel = d3.timeFormat(localThis.dateTimeConversion[localThis.axisLabelFormat])
    } else {
      if (localThis.type === "Date") {
        timeFormatLabel = d3.timeFormat('%b');
      } else if (localThis.type === "Time") {
        timeFormatLabel = d3.timeFormat('%I:%M');
      }
    }
    

    // create axes and line for data to be appended later to the DOM
    const yAxis = d3.axisLeft()
      .tickSizeInner(-width)
      .scale(y),
      xAxis = d3.axisBottom()
        .tickSizeInner(-height)
        .tickFormat(timeFormatLabel)
        .scale(x),
      line = d3.line()
        .curve(d3.curveLinear)
        .x(function (d) { return x(d[dataKey]); })
        .y(function (d) { return y(d.value); }),
      svg = d3
        .select(selection_string)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Is this for the line changing color at a specific threshold?? LP
    const gradID = this.propID + "-gradient",
      pathID = this.propID;
    
    if (localThis.threshold !== null) {
      svg.append("linearGradient")
        .attr("id", gradID)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", y(localThis.threshold))
        .attr("x2", 0).attr("y2", y(localThis.threshold + 1))
        .selectAll("stop")
        .data([
          { offset: "0%", color: localThis.colors[0] },
          { offset: "50%", color: localThis.colors[1] }
        ])
        .enter().append("stop")
        .attr("offset", function (d) {
          return d.offset;
        })
        .attr("stop-color", function (d) { return d.color; });
    }

    svg.append("g")
      .attr("class", "x axis x-axis xaxis")
      .style('fill', 'grey')
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("x", (width / 2))
      .attr("y", 25)
      .attr("dy", ".71em")
      .style("fill", "black")
      .style("text-anchor", "middle")
      .attr("class", "xaxis-tick")
      .attr("font-size", this.axisFontSize)
      .text(this.xAxisLabel)
      .attr("y", 40)
      .attr("class", "axislabel x-axis-label");

    const text = svg.selectAll("g.tick > text");
    // angle the labels on x-axis if specified
    if (this.xAxisAngle > 0) {
      text
        .attr("transform", `rotate(${this.xAxisAngle}) translate(${margin.top}, 0)`)
        .style("text-anchor", "middle");

      const dimensions = text.node().getBBox();
      const array = Array.from(text._groups[0]).map((item: any, index: number) => item.getBBox().width);
      // const dimwid = d3.max(array);

      if (this.xAxisAngle < 45) {
        text.attr("x", function (a, b, c, d) {
          if (array[b] < margin.bottom) {
            return dimensions.width / 2;
          } else {
            return dimensions.width / 1.5;
          }
        })
          .attr("y", dimensions.height - margin.top);
      }

      if (this.xAxisAngle >= 45) {
        text.attr("x", function (a, b, c, d) {
          if (array[b] < margin.bottom) {
            return dimensions.width - 15;
          } else {
            return dimensions.width - 10;
          }
        })
          .attr("y", dimensions.height - 10);
      }

      if (this.xAxisAngle === 90) {
        text.attr("x", dimensions.width)
          .attr("y", -margin.left / 2 - 5);
      }
    }

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

    if (localThis.threshold !== null) {
      for (let key in data) {
          svg.append("path")
            .datum(data[key])
            .attr("id", pathID + key)
            .attr("class", "line linechartline")
            .style("stroke", `url("#${gradID}")`)
            .attr("d", line);
      }
    } else {
      for (let key in data) {
          svg.append("path")
            .datum(data[key])
            .attr("id", pathID + key)
            .attr("class", "line linechartline")
            .attr("d", line);
      }
    }

    const xMap = function (d) { return x(xValue(d)); };
    const yMap = function (d) { return y(yValue(d)); };
    const clip_id = "clip-" + this.propID;

    // add the dots at each data point and add events for mouseover/out to show/hide tooltips
    for (let key in data) {
        svg
          .selectAll(".dot")
          .data(data[key])
          .enter()
          .append("circle")
          .attr("class", `dot${key}`)
          .attr("r", 5)
          .attr("cx", xMap) // set the center of the dot using calculated x and y values
          .attr("cy", yMap)
          .attr("clip-path", "url(#" + clip_id + ")")
          .attr("fill", "black")
          .attr("opacity", 0)
          .on("mouseover", function (d) {
            tooltip
              .transition()
              .duration(100)
              .style("opacity", 1);
            tooltip
              .html(
                key + "<br>" + 
                localThis.xAxisLabel + ": " +
                formatDate(d.date || d.time) +
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
          .on("mouseout", function (d) {
            tooltip
              .transition()
              .duration(300)
              .style("opacity", 0);
            d3
              .select(this)
              .transition()
              .duration(50)
              .attr("opacity", 0);
          })
          .on("click", localThis.clickEvent.emit);
    }    
  }

}
