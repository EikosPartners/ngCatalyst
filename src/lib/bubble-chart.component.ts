import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, AfterViewInit, AfterViewChecked } from '@angular/core';
import * as d3 from 'd3';
import {Duration} from 'luxon';

@Component({
  selector: 'eikos-bubble-chart',
  template: `
<div [ngStyle]="area" >
    <div [id]="propID" style="width:100%;height:100%"> </div>
</div>
  `
})

// HTK - the bubbles sometimes go outside the margins because of their radius, should we pin radius to margin size as well?
// also found a use case where the graph didn't render because #s ended up too small because margins were bigger than dimensions themselves - is this a real bug?

export class BubbleChartComponent implements OnInit, OnChanges, AfterViewInit, AfterViewChecked {
  @Output() clickEvent = new EventEmitter<any>();
  @Input() propID = 'bubble';
  @Input() data: { label: string, value: number, x: number, y: number }[];
  @Input() isTime = false;
  @Input() isDate = false;
  @Input() themeColors = ["#081A4E", "#092369", "#1A649F", "#2485B4", "#2DA8C9", "#5DC1D0", "#9AD5CD", "#D5E9CB"];
  // need 8 hex colors;
  @Input() yAxisLabel = 'Value';
  @Input() xAxisLabel = 'Date';
  @Input() divHeight: any = "100%"; // for a % you need a container div with a non-% height and width;
  @Input() divWidth: any = "100%";
  @Input() margin = { top: 50, right: 50, bottom: 50, left: 50 }; // maybe make this a calc based on radius so if x or y is 0 it will show whole bubble?;
  dateFormat = '%Y-%m-%d';
  givenHeight = this.divHeight;
  givenWidth = this.divWidth;

  constructor() {
    const localThis = this;
    window.addEventListener('resize', this.resizeEvent.bind(this));
  }

  resizeEvent() {
    this.drawBubbleChart(this.processedData);
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

  get processedData() {
    const data = this.data;
    try {
      if (data) {
        data.sort(function (x, y) {
          return d3.descending(x.value, y.value);
        });
      }
    } catch (err) {
      console.error(err);
    }
    return data;
  }

  ngOnInit() {
    // this.drawBubbleChart();
    this.drawBubbleChart(this.processedData);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.data.firstChange) {
      // this.drawBubbleChart();
      this.drawBubbleChart(this.processedData);
    }
  }

  ngAfterViewInit() {
    // this.drawBubbleChart();
    this.drawBubbleChart(this.processedData);
  }

  ngAfterViewChecked() {
    const offsetHeight = document.querySelectorAll('#' + this.propID)[0]['offsetHeight'];
    const offsetWidth = document.querySelectorAll('#' + this.propID)[0]['offsetWidth'];

    if (offsetHeight !== this.givenHeight || offsetWidth !== this.givenWidth) {
      this.givenHeight = offsetHeight;
      this.givenWidth = offsetWidth;
      // this.drawBubbleChart();
      this.drawBubbleChart(this.processedData);
    }
  }

  xValue(d) {
    return d.x;
  }
  yValue(d) {
    return d.y;
  }
  zValue(d) {
    return d.value;
  }

  pretty_duration(d) {
    return Duration.fromObject({ "seconds": d }).normalize().toObject(); // this.moment??
  }

  get_min_bubble_size(max_value_size, cutoff, min_pixels) {
    return (max_value_size >= cutoff) ? min_pixels : max_value_size;
  }

  get_max_bubble_size(max_value_size, min_bubble_size, cutoff, max_pixels) {
    return (max_value_size >= cutoff) ? max_pixels : min_bubble_size * max_value_size + 25;
  }

  get_bubble_sizes(max_value_size, divHeight, divWidth) {
    const cutoff = 10,
      min_pixels = 5,
      max_pixels = ((divHeight + divWidth) / 2) / 6;

    const min_bubble_size = (max_value_size < min_pixels) ? min_pixels : this.get_min_bubble_size(max_value_size, cutoff, min_pixels);
    return {
      'min': min_bubble_size,
      'max': this.get_max_bubble_size(max_value_size, min_bubble_size, cutoff, max_pixels)
    };
  }

  get_duration_zoom_range(max_value_mins, min_zoom_mins = 1) {
    return [1, max_value_mins / min_zoom_mins];
  }

  get_x_zoom_range(asrs, xval, min_zoom_mins = 1) {
    return this.get_duration_zoom_range(d3.max(asrs, xval), min_zoom_mins);
  }

  drawBubbleChart(data) {
    if (!data) {
      return;
    }
    const localThis = this;
    const selection_string = "#" + this.propID;
    const pretty_duration = this.pretty_duration;
    const xValue = this.xValue;
    const yValue = this.yValue;
    const zValue = this.zValue;
    let element: any;

    const selected = document.querySelectorAll(selection_string);

    if (selected[0] == null) {
      element = [{ clientWidth: 500, clientHeight: 500 }];
    } else {
      element = selected[0];
    }

    const margin = Object.assign({ top: 50, bottom: 50, right: 50, left: 50 }, this.margin);
    const elementWidth = element.clientWidth;
    const elementHeight = element.clientHeight;
    const ternaryWidth = (elementWidth > 0 && elementWidth < window.innerWidth) ? elementWidth : window.innerWidth;
    const width = ternaryWidth - margin.left - margin.right;
    const ternaryHeight = elementHeight > 0 ? elementHeight : 400;
    let height = ternaryHeight - margin.top - margin.bottom;
    // retrieving globals
    const colors = this.themeColors;
    if (height < 0) {
      height = 300;
    }

    let svg;
    const containerId = "#" + this.propID,
      containerIdSvg = containerId + " svg",
      containerIdG = containerIdSvg + " g";

    // clear previous tooltips and chart from DOM
    d3.selectAll(`.${this.propID}_tooltip`).remove();
    if (document.querySelectorAll(selection_string + " svg")[0] != null) {
      document.querySelectorAll(selection_string + " svg")[0].remove();
    }

    const formatDate = d3.timeParse(this.dateFormat);

    let xScale;
    // create scale for x-axis for date values
    if (this.isDate) {
      xScale = d3.scaleTime().range([0, width]);
      data = data.map(function (d) {
        if (d["mapped"]) { return d; }
        d.x = formatDate(d.x);
        d["mapped"] = true;
        return d;
      });
    } else {
      xScale = d3.scaleLinear().range([0, width]);
    }

    const xMap = function (d) {
      return xScale(xValue(d));
    },
      // create the x-axis with the already created scale and set number of ticks. will be added to DOM later
      xAxis = d3.axisBottom()
        .scale(xScale)
        .tickSizeInner(-height)
        .ticks(6);

    // set tick format for x-axis to date or time depending on if isDate is true
    if (this.isDate) {
      xAxis.tickFormat(d3.timeFormat(this.dateFormat));
    } else {
      xAxis.tickFormat(function (d) {
        return localThis.isTime ? pretty_duration(60 * d) : d;
      });
    }

    // create scale for y-axis 
    const yScale = d3.scaleLinear()
      .range([height, 0]),
      // will be used to calculate the postion of bubble later
      yMap = function (d) {
        return yScale(yValue(d));
      },
      // create y-axis using the scale. will be added to DOM later
      yAxis = d3.axisLeft()
        .scale(yScale)
        .tickSizeInner(-width)
        .ticks(4);

    //create the bubble sizes based on data values
    const max_value_size = Math.sqrt(d3.max(data, function (d) {
      return +d.value;
    }));
    const bubble_sizes = this.get_bubble_sizes(max_value_size, height, width);
    const min_bubble_size = bubble_sizes['min'];
    const max_bubble_size = bubble_sizes['max'];
    // create the scale used to size the bubbles based on the calculated min and max sizes of bubbles
    const zScale = d3.scaleLinear().domain([1, max_value_size]).range([
      min_bubble_size,
      max_bubble_size
    ]),
      zMap = function (d) { return zScale(Math.sqrt(zValue(d))); };

    const cValue = function (d) {
      return d.value;
    };

    const valMin = d3.min(data, zValue);
    const valMax = d3.max(data, zValue);


    const color = d3.scaleQuantize().range(colors).domain([valMin, valMax]);

    const tooltip = d3.select("body")
      .append("div")
      .attr("class", `d3_visuals_tooltip ${this.propID}_tooltip`)
      .style("opacity", 0);

    // Get min and max values for x and y axis
    let xMin = d3.min(data, xValue);
    let xMax = d3.max(data, xValue);
    const yMin = d3.min(data, yValue);
    const yMax = d3.max(data, yValue);

    // Determine padding for x-axis if it's dates.
    if (this.isDate) {
      const min = xScale(xMin);
      const max = xScale(xMax);

      xMin = xScale.invert(min - (min * .001));
      xMax = xScale.invert((max * .001) + max);
    } else {
      xMin = xMin - (xMin / 2);
      xMax = xMax + (xMax / 4);
    }


    // Subtract half the min value from min and add one fourth
    // of the max to the max so that the bubbles never go outside of the graph
    xScale.domain([xMin, xMax]);
    yScale.domain([yMin - yMin / 2, yMax + yMax / 4]);
    svg = d3.select(containerId)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("rect")
      .attr("fill-opacity", "0")
      .attr("width", width)
      .attr("height", height);

    //add x axis to DOM
    svg.append("g")
      .attr("class", "x axis")
      .attr("id", "top-x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -10)
      .style("text-anchor", "end")
      .text(this.xAxisLabel);

    // add y-axis to the DOM
    svg.append("g")
      .attr("class", "y axis")
      .attr("id", "top-y")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(this.yAxisLabel);

    // const mouseOver = this.mouseOverBubble;
    // add all of the bubbles of the data points and set colors
    svg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", zMap)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .attr("stroke", "gray")
      .attr("stroke-width", 1)
      .style("fill", function (d) {
        const saveThisColor = color(cValue(d));
        return saveThisColor;
      })
      .style("opacity", 0.75)
      // add event listener to show the tooltips when moused over
      .on("mouseover", function (d) {
        tooltip.transition()
          .duration(100)
          .style("opacity", 1);
        tooltip.html('<b class="tooltip-header">' + d.label + '</b>' + "<br/><b>" + localThis.xAxisLabel + "</b> " + (localThis.isTime ? localThis.pretty_duration(60 * localThis.xValue(d)) : localThis.xValue(d)) + "<br/><b>" + localThis.yAxisLabel + ": </b>" + localThis.yValue(d)
          .toFixed(2) + "<br> <b>value:</b> " + localThis.zValue(d))
          .style("left", (d3.event.pageX + 5) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
        d3.select(tooltip[0])
          .transition()
          .duration(50)
          .style("opacity", 1);
      })
      // add even listener to hide tooltip when user mouses out of bubble
      .on("mouseout", function (d) {
        // const tooltip = d3.select(`.${localThis.propID}_tooltip`);
        tooltip.transition().duration(300).style("opacity", 0);
        d3.select(tooltip[0])
          .transition()
          .duration(200)
          .style("opacity", 0);
      })
      // add click event to each bubble
      .on("click", function (d) {
        localThis.clickEvent.emit(d);
      });
  }


}
