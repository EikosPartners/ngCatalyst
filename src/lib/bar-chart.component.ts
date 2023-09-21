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
  @Input() data: Object; // {"bar data label": [{dateOrOtherLabel: string, value: number}]} Data should be an object, each key will be a label for the dataset and bar. The value of the key should be an array of objects (array like the data array that the bar chart used to take). each of these objects is a data point
  /* {
      "Company 1": [
        { "name": "11-15-2019", "value": 200}, ...
      ],
      "Company 2": [
        { "date": "11-15-2019", "value": 150}, ...
      ], ...
    } 
    OR
    {
      "Company 1": [
        { "dataType": "PnL", "value": 200}, 
        { "dataType": "Exposure", "value": 250}, ...
      ],
      "Company 2": [
        { "dataType": "PnL", "value": 150}, 
        { "dataType": "Exposure", "value": 200}, ...
      ], ...
    }
    The bar chart now supports Time series for the X axis to visualize data over time.
    The key for the data does not need to be "date" or "time", but you must pass the dateTimeFormat prop so that the component knows it is time related data
    The key for the Y axis MUST be "value".
    Example datapoint: {"anyStringYouWant": "11-15-2019", "value": 14} ***MUST PASS dateTimeFormat
                                OR
                      {"anyStringYouWant": "Exposure", "value": 14}
    */
  @Input() propID = "barchart";
  @Input() colors: any = [ //This is the array of colors that will be used by the bar chart
    "#9400D3",
    "#4B0082",
    "#0000FF",
    "#00FF00",
    "#FFFF00",
    "#FF7F00",
    "#FF0000"
  ]; 
  /* This can either be an Array of color strings or an Object
   If an Array is passed then the colors will be matched in order of the keys of the data Object (order is not guaranteed). 
     If an Object is used then format should be like this 
     {
       "Company 1": "blue",
       "Company 2": "red", 
       ...
     } 
     The key must match the data key in the data Object prop
     You can also pass an array of colors as the value of the key. the chart will then use this array and cycle through the colors for each bar of that one dataset
  */
  @Input() yAxisLabel = "y";
  @Input() xAxisLabel = "x";
  @Input() xAxisAngle = 45;
  @Input() yAxisAngle = 45;
  @Input() divHeight: any = "100%"; // for a % you need a container div with a non-% height and width;
  @Input() divWidth: any = "100%";
  @Input() showTicks: Boolean = false;
  @Input() marker: Number; // The Y axis value where you would like a marker line to be drawn
  @Input() markerColor: String = "#000"; //the color of the marker line, default is black
  @Input() markerWidth: String = "1"; //default thickness of marker line
  @Input() margins = { top: 50, bottom: 50, right: 50, left: 50 } // margins object. These are the base values that will be used but you amy pass an Object with one or more keys to overwrite only the vaules you pass
  /* An example is you pass an Object like this 
      { top: 10 }
    This Object will be merged into the base margins Object passed above and will only change the top margin from 20 to 50
    Result will be { top: 10, bottom: 50, right: 50, left: 50 }
  */
  @Input() dateTimeFormat; //the format of the X axis data in a Moment string. Example is "MM-DD-YYYY" 
  /* Now you do not need to preformat your data to be passed into the component
     The date or time value for the X axis can be in any format and must match the format here.
     It will then automatically be formatted to the correct D3 date or time format to be used in the Chart
   */
  @Input() axisLabelFormat; // This is the date or time format of the label that will be displayed on the X axis (Ex:"MM/DD")
  // You can customize it to any format just pass the Moment string for the format

  @Input() tooltipLabelFormat; //This is the date or time format of the data that will be  displayed in the tooltip
  //You can customize it to any format just pass the Moment string for the format

  givenHeight = this.divHeight;
  givenWidth = this.divWidth;

  timeDictionary: Object = {
    'HH': '%H',
    'H': '%H',
    'hh': '%I',
    'h': '%I',
    'MM': '%m',
    'mm': '%M',
    'm': '%M',
    'ss': '%S',
    's': '%S',
    'a': '%p',
    'A': '%p',
    'DD': '%d',
    'D': '%e',
    'DDD': '%j',
    'DDDD': '%j',
    'MMMM': '%B',
    'MMM': '%b',
    'M': '%m',
    'ddd': '%a',
    'dddd': '%A',
    'YY': '%y',
    'YYYY': '%Y',
    'Q': '%q',
    'X': '%s',
    'x': '%Q'
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

  momentToD3(timeString: string) {
    let subStrings: string[] = timeString.match(/\w+|\s+|[^\s\w]+/g)
    subStrings = subStrings.map(str => {
      if (this.timeDictionary[str]) {
        str = this.timeDictionary[str]
      }
      return str
    })
    return subStrings.join('')
  }

  ngAfterViewInit() {
    if (!this.data || Array.isArray(this.data) || this.data === null) {
      console.error('Data must be an object')
    }
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

    let timeFormatLabel = null,
      formatTooltipDate;
    if (this.dateTimeFormat) {
      // create parsers to format the data for display in graph
      const dateTimeParser = d3.timeParse(this.momentToD3(this.dateTimeFormat))
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
        timeFormatLabel = d3.timeFormat(this.momentToD3(this.axisLabelFormat))
      }

      //create date/time formatter to format text on tooltip
      if (this.tooltipLabelFormat) {
        formatTooltipDate = d3.timeFormat(this.momentToD3(this.tooltipLabelFormat));
      } else {
        if (dataKey === "date") {
          formatTooltipDate = d3.timeFormat('%B %-d %Y');
        } else if (dataKey === "time") {
          formatTooltipDate = d3.timeFormat('%I:%M %p');
        }
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
    const margin = Object.assign({
      top: 50, 
      bottom: 50 + d3.axisBottom().tickSizeInner(), 
      right: 50, 
      left: 50 + d3.axisLeft().tickSizeOuter()
    }, this.margins)
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
      .attr("class", "label x-axis-label")
      .attr("x", width / 2)
      .attr("y", this.margins.bottom)
      .style("text-anchor", "middle")
      .text(xaxisvalue);

    const xAxisLabelHeight = chart.select(".label.x-axis-label").node().getBBox().height + 5;

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
      while (textLength > (localThis.margins.bottom - xAxisLabelHeight) && text.length > 0) {
        text = text.slice(0, -1);
        self.text(text + "...");
        textLength = self.node().getComputedTextLength();
      }
      self.append("svg:title").text(fullText);
    });

    chart
      .append("g")
      .attr("class", "y axis y-axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -this.margins.left)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(yaxisvalue);

    const yAxisLabelHeight = chart.select(".label.y-axis-label").node().getBBox().height + 5;

    const yAxisText = chart.selectAll("g.y.axis g.tick text");
    yAxisText.attr("class", "y-axis-text");

    yAxisText.each(function() {
      // truncate labels if the calculated size exceeds the allotted space
      var self = d3.select(this),
        textLength = self.node().getComputedTextLength(),
        fullText = self.text(),
        text = self.text();
      while (textLength > (localThis.margins.left - yAxisLabelHeight) && text.length > 0) {
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
          .style("fill", (d, i) => {
            if (Array.isArray(colorMap[key])) {
              return colorMap[key][i] || colorMap[key][i % colorMap[key].length];
            } 
            return colorMap[key] || "auto"
          })
          .on("mouseover", function(d, i ) {
            const index = i;
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
                  (formatTooltipDate ? formatTooltipDate(d[dataKey]) : d[dataKey]) +
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
                if (Array.isArray(colorMap[key])) {
                  currentFill =  colorMap[key][index] || colorMap[key][index % colorMap[key].length];
                } else {
                  currentFill = colorMap[key]
                }
                
                currentFill = hex2rgb(currentFill);
                const darker = currentFill.map(item => {
                  // tslint:disable-next-line: radix
                  return parseInt(item) * 0.75;
                });
                return `rgb(${darker[0]}, ${darker[1]}, ${darker[2]})`;
              });
          })
          .on("mouseout", function(d, i) {
            const index = i;
            d3.select(this)
              .transition()
              .duration(100)
              .style("fill", () => {
                if (Array.isArray(colorMap[key])) {
                  return colorMap[key][i] || colorMap[key][i % colorMap[key].length];
                } 
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
