import {
  Component,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  AfterViewChecked
} from "@angular/core";
import * as d3 from "d3";
import { isEqual, flatten } from "lodash";

@Component({
  selector: "eikos-bar-chart",
  template: `
    <ng-container>
      <div [ngStyle]="area">
        <div [id]="propID" style="width:100%;height:100%"></div>
      </div>
    </ng-container>
  `
})
export class BarChartComponent implements OnChanges, AfterViewInit, AfterViewChecked {
  @Output() clickEvent = new EventEmitter<any>();
  @Input() data: Object;
  @Input() propID = "barchart";
  @Input() showMe = true;
  @Input() color = "#2DA8C9";
  @Input() colors = [
    "#9400D3",
    "#4B0082",
    "#0000FF",
    "#00FF00",
    "#FFFF00",
    "#FF7F00",
    "#FF0000"
  ];
  @Input() yAxisLabel = "y";
  @Input() xAxisLabel = "x";
  @Input() xAxisAngle = 45;
  @Input() yAxisAngle = 45;
  @Input() divHeight: any = "100%"; // for a % you need a container div with a non-% height and width;
  @Input() divWidth: any = "100%";
  @Input() showTicks: Boolean = false;
  @Input() marker: Number;
  @Input() markerColor: String = "#000"; //default is black
  @Input() markerWidth: String = "1"; //default thickness of marker line
  @Input() marginTop: number = 50;
  @Input() marginRight: number = 50;
  @Input() marginBottom: number = 50;
  @Input() marginLeft: number = 50;
  @Input() dateTimeFormat;
  @Input() axisLabelFormat;
  @Input() tooltipLabelFormat;

  givenHeight = this.divHeight;
  givenWidth = this.divWidth;

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
    window.addEventListener("resize", this.drawBarPlot.bind(this));
  }

  get area() {
    let height, width;
    if (typeof this.divHeight === "number") {
      height = this.divHeight + "px";
      width = this.divWidth + "px";
    } else {
      height = this.divHeight;
      width = this.divWidth;
    }
    return { height, width };
  }

  ngAfterViewInit() {
    this.drawBarPlot();
  }

  ngAfterViewChecked() {
    const offsetHeight = document.querySelectorAll("#" + this.propID)[0][
      "offsetHeight"
    ];
    const offsetWidth = document.querySelectorAll("#" + this.propID)[0][
      "offsetWidth"
    ];

    if (offsetHeight !== this.givenHeight || offsetWidth !== this.givenWidth) {
      this.givenHeight = offsetHeight;
      this.givenWidth = offsetWidth;
      this.drawBarPlot();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.data &&
      !changes.data.firstChange &&
      !isEqual(changes.data.previousValue, changes.data.currentValue)
    ) {
      this.drawBarPlot();
    }
  }

  drawBarPlot() {
    if (!this.data) {
      return
    }
    const id = this.propID,
      yaxisvalue = this.yAxisLabel,
      xaxisvalue = this.xAxisLabel;
    const localThis = this;

    // grab data for a line to determine the datakey for x axis
    const dataSample = this.data[Object.keys(this.data)[0]];
    // get datakey for the x axis by finding keys of data point and filtering out value key
    const dataKey = Object.keys(dataSample[0]).filter(key => key !== "value")[0];

    const data = {};
    for (let key in this.data) {
      const copy = this.data[key].map(dataPoint => {
        dataPoint = Object.assign({}, dataPoint);
        return dataPoint;
      })
      data[key] = copy;
    }

    let timeFormatLabel = null;
    if (dataKey === 'date' || dataKey === 'time') {
      // create parsers to format the data for display in graph
      const dateTimeParser = d3.timeParse(this.dateTimeConversion[this.dateTimeFormat])
      for (let key in data) {
        data[key].forEach(el => {
          el[dataKey] = dateTimeParser(el[dataKey]);
        })
        data[key] = data[key].sort(function (a, b) {
          return a[dataKey] - b[dataKey];
        });
      }
      // format for x axis labels based on date or time, will be used to process raw data to readable dates/times
      // the format can be passed as a prop or is set by default whether the data type is data or time
      if (this.axisLabelFormat) {
        timeFormatLabel = d3.timeFormat(this.dateTimeConversion[this.axisLabelFormat])
      }
    }

    //create date/time formatter to format text on tooltip
    let formatDate;
    if (this.tooltipLabelFormat) {
      formatDate = d3.timeFormat(this.dateTimeConversion[this.tooltipLabelFormat]);
    } else {
      if (dataKey === "date") {
        formatDate = d3.timeFormat('%B %-d %Y');
      } else if (dataKey === "time") {
        formatDate = d3.timeFormat('%I:%M %p');
      }
    }
    

    d3.selectAll(`.${this.propID}_tooltip`).remove();

    const selection_string = "#" + id;
    if (document.querySelectorAll(selection_string + " svg")[0] != null) {
      document.querySelectorAll(selection_string + " svg")[0].remove();
    }

    let element: any;
    const selected = document.querySelectorAll(selection_string);

    if (selected[0] == null) {
      element = { clientWidth: 500, clientHeight: 500 };
    } else {
      element = selected[0];
    }
    const margin = {
      top: this.marginTop,
      right: this.marginRight,
      bottom: this.marginBottom + d3.axisBottom().tickSizeInner(),
      left: this.marginLeft + d3.axisLeft().tickSizeOuter()
    };
    const width = element.clientWidth - margin.left - margin.right - 0.5;
    let height = element.clientHeight - margin.top - margin.bottom;

    if (height < 0) {
      height = 300;
    }
    const allDataPoints = flatten(Object.values(data));
    const dataValues = d3.extent(allDataPoints, item => item.value).reverse();
    const dataNames = allDataPoints.map(item => item[dataKey])

    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(dataNames)
      .paddingInner(0.2)
      .paddingOuter(0.2);

    const y = d3
      .scaleLinear()
      .range([0, height])
      .domain(dataValues);

    const xAxis = d3
      .axisBottom()
      .scale(x)
      .tickSizeOuter(0)
      .tickFormat(timeFormatLabel);

    const yAxis = d3.axisLeft().scale(y);

    if (this.showTicks) {
      yAxis.tickSizeInner(-width);
    }

    // create color map object to map labeled data with color supplied
    let colorMap = {};
    if (this.colors && Array.isArray(this.colors)) {
        Object.keys(data).forEach((key, ind) => {
          if (localThis.colors.length <= ind) {
            colorMap[key] = localThis.colors[localThis.colors.length % ind];
          } else {
            colorMap[key] = localThis.colors[ind];
          }
        })
    } else if (this.colors && typeof this.colors === 'object') {
      colorMap = this.colors;
    }

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", `d3_visuals_tooltip ${this.propID}_tooltip`)
      .style("opacity", 0);

    const chart = d3
      .select(selection_string)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    chart
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label x-label")
      .attr("x", width / 3 + margin.right)
      .attr("y", 0)
      .style("text-anchor", "middle")
      .text(xaxisvalue);

    const xAxisText = chart.selectAll("g.x.axis g.tick text");
    xAxisText.attr("class", "x-axis-text");

    if (this.xAxisAngle > 0 && this.xAxisAngle < 180) {
      xAxisText
        .attr("text-anchor", `${this.xAxisAngle <= 90 ? "start" : "end"}`)
        .attr("transform-origin", `left ${xAxisText.attr("dy")}`)
        .attr(
          "transform",
          `rotate(${
            this.xAxisAngle <= 90 ? this.xAxisAngle : 90 - this.xAxisAngle
          })`
        );
    }

    xAxisText.each(function() {
      // truncate labels if the calculated size exceeds the allotted space
      var self = d3.select(this),
        textLength = self.node().getComputedTextLength(),
        fullText = self.text(),
        text = self.text();
      while (textLength > localThis.marginBottom && text.length > 0) {
        text = text.slice(0, -1);
        self.text(text + "...");
        textLength = self.node().getComputedTextLength();
      }
      self.append("svg:title").text(fullText);
    });

    chart
      .append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .style("text-anchor", "end")
      .text(yaxisvalue);

    const yAxisText = chart.selectAll("g.y.axis g.tick text");
    yAxisText.attr("class", "y-axis-text");

    yAxisText.each(function() {
      // truncate labels if the calculated size exceeds the allotted space
      var self = d3.select(this),
        textLength = self.node().getComputedTextLength(),
        fullText = self.text(),
        text = self.text();
      while (textLength > localThis.marginLeft && text.length > 0) {
        text = text.slice(0, -1);
        self.text(text + "...");
        textLength = self.node().getComputedTextLength();
      }
      self.append("svg:title").text(fullText);
    });

    function hex2rgb(hex) {
      // tslint:disable-next-line:no-bitwise
      return [
        (<any>"0x" + hex[1] + hex[2]) | 0,
        (<any>"0x" + hex[3] + hex[4]) | 0,
        (<any>"0x" + hex[5] + hex[6]) | 0
      ];
    }

      for (let key in data) {
        chart
          .selectAll(".bar")
          .data(data[key])
          .enter()
          .append("rect")
          .attr("class", `bar${key}`)
          .attr("x", function(d) {
            return x(d[dataKey]) + (Object.keys(data).indexOf(key) * (x.bandwidth() - x.paddingInner()) / Object.keys(data).length);
          })
          .attr("y", function(d) {
            if (d.value < 0) {
              return y(0);
            } else {
              return y(d.value);
            }
          })
          .attr("height", function(d) {
            if (dataValues.every(it => it > 0)) {
              return height - y(d.value);
            } else {
              return Math.abs(y(d.value) - y(0));
            }
          })
          .attr("width", (x.bandwidth() - x.paddingInner()) / Object.keys(data).length)
          .style("fill", () => {
            return colorMap[key] || "auto"
          })
          .on("mouseover", function(d) {
            const yval = d.value;
            tooltip
              .transition()
              .duration(100)
              .style("opacity", 1);
            tooltip
              .html(
                key + "<br>" +
                  xaxisvalue +
                  ": <b>" +
                  (formatDate ? formatDate(d[dataKey]) : d[dataKey]) +
                  "</b><br>" +
                  yaxisvalue +
                  ": <b>" +
                  yval +
                  "</b>"
              )
              .style("left", d3.event.pageX + 5 + "px")
              .style("top", d3.event.pageY - 28 + "px");
            d3.select(this)
              .transition()
              .duration(50)
              .style("fill", function(dt, i) {
                let currentFill: any;
                currentFill = hex2rgb(colorMap[key]);
                const darker = currentFill.map(item => {
                  // tslint:disable-next-line: radix
                  return parseInt(item) * 0.75;
                });
                return `rgb(${darker[0]}, ${darker[1]}, ${darker[2]})`;
              });
          })
          .on("mouseout", function(d) {
            d3.select(this)
              .transition()
              .duration(100)
              .style("fill", () => {
                return colorMap[key] || "auto"
              });
            tooltip
              .transition()
              .duration(300)
              .style("opacity", 0);
          })
          .on("click", function(d) {
            localThis.clickEvent.emit(d);
          });
      }
      if (this.marker !== undefined) {
        chart
          .append("g")
          .append("line")
          .attr("x1", 0)
          .attr("y1", y(this.marker))
          .attr("x2", width)
          .attr("y2", y(this.marker))
          .attr("stroke-width", this.markerWidth)
          .attr("class", "marker-line")
          .attr("stroke", this.markerColor);
      }
  }
}
