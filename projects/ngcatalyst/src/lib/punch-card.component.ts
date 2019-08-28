import { Component, Output, EventEmitter, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, AfterViewChecked } from '@angular/core';
import * as d3 from 'd3';
import luxon from 'luxon';

@Component({
  selector: 'eikos-punch-card',
  styles: [`
    .punch-border {
      stroke: grey
    }
  `],
  template: `
  <h2>{{title}}</h2>
  <div style="margin-left: 3%" [ngStyle]="area">
      <div [id]="propID" style="width:100%;height:100%"> </div>
  </div>
`
})
export class PunchCardComponent implements OnInit, OnChanges, AfterViewInit, AfterViewChecked {
  @Output() clickEvent = new EventEmitter<any>();
  @Input() propID = 'punch';
  @Input() data: [{day_of_week: string, hour_volumes: []}];
  @Input() title: string;
  @Input() axisColors = ["#e5b1a5", "#ff2b2b"];
  @Input() axisLabel = 'Date';
  @Input() colors =  ["#081A4E", "#092369", "#1A649F", "#2485B4", "#2DA8C9", "#5DC1D0", "#9AD5CD", "#D5E9CB", "#64B5F6", "#01579B"];
  @Input() divHeight: any = "100%";
  @Input() divWidth: any = "100%";
  // tslint:disable-next-line:max-line-length
  labelsX = ["12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p"];
  givenHeight = this.divHeight;
  givenWidth = this.divWidth;

// HTK reference https://gist.github.com/kaezarrex/10122633

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

  constructor() { }

  ngOnInit() {
    this.drawPunchCard();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && !changes.data.firstChange) {
      this.drawPunchCard();
    } else if (changes.color && !changes.color.firstChange) {
      this.drawPunchCard();
    }
  }

  ngAfterViewInit() {
    this.drawPunchCard();
  }

  ngAfterViewChecked() {
    const offsetHeight = document.querySelectorAll('#' + this.propID)[0]['offsetHeight'];
    const offsetWidth =  document.querySelectorAll('#' + this.propID)[0]['offsetWidth'];

    if (offsetHeight !== this.givenHeight || offsetWidth !== this.givenWidth) {
      this.givenHeight = offsetHeight;
      this.givenWidth = offsetWidth;
      this.drawPunchCard();
    }
  }

  getDay (day) {
    const days = [
        { name: 'Mon', value: 2, description: 'Monday' },
        { name: 'Tue', value: 3, description: 'Tuesday' },
        { name: 'Wed', value: 4, description: 'Wednesday' },
        { name: 'Thu', value: 5, description: 'Thursday' },
        { name: 'Fri', value: 6, description: 'Friday' },
        { name: 'Sat', value: 7, description: 'Saturday' },
        { name: 'Sun', value: 1, description: 'Sunday' }
    ];
    const result = days.filter(d => {
      return d.name === day;
    });
    return result[0].value;
  }

  getDayName (day) {
    const days = [
        { name: 'Mon', value: "1", description: 'Monday' },
        { name: 'Tue', value: "2", description: 'Tuesday' },
        { name: 'Wed', value: "3", description: 'Wednesday' },
        { name: 'Thu', value: "4", description: 'Thursday' },
        { name: 'Fri', value: "5", description: 'Friday' },
        { name: 'Sat', value: "6", description: 'Saturday' },
        { name: 'Sun', value: "0", description: 'Sunday' }
    ];
    const result = days.filter(d => {
      return d.value === day;
    });

    return result[0].name;
  }

  drawPunchCard() {
    if (this.data === undefined) { return; }
      // try {
      //   if (this.data.length === 0) { return; }
      // } catch (e) {
      //   return;
      // }

    const localThis = this;
    // This was needed for the Incident Set Modal Test to pass.

    const elementName = "#" + this.propID;
    if (document.querySelectorAll(elementName + " svg")[0] != null) {
      document.querySelectorAll(elementName + " svg")[0].remove();
    }

    let data = JSON.parse(JSON.stringify(this.data)); // deep copy


    const margin = { top: 40, right: 75, bottom: 40, left: 15 };
    const padding = 3;
    const borderWidth = 1;

    let element: any;

    const selected = document.querySelectorAll(elementName);

    if (selected[0] == null) {
      element = {clientWidth: 1000, clientHeight: 500};
    } else {
      element = selected[0];
    }


    const xLabelHeight = element.clientHeight / this.data.length;
    const yLabelWidth = element.clientWidth / d3.max(
      this.data.map(function(d) {
        return d.hour_volumes.length;
      }));


    const width =
      element.clientWidth - margin.left - margin.right - yLabelWidth;
    const height =
    element.clientHeight / 24 * 7 +
      2 * xLabelHeight - margin.top - margin.bottom;

    // console.log(selected);
    // console.log(element.clientWidth);
    // console.log(element.clientHeight);


    //   if (this..changeHeight !== undefined ) {
//       this..changeHeight(height + margin.top + margin.bottom + 2 * xLabelHeight);
//  }

    const chart = d3
      .select(elementName)
      .append("svg")
      .attr("width", "100%")
      .attr("data-height", "0.5678")
      // try xLabelHeight?
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height}`)
      .attr("preserveAspectRatio", "xMaxYMax meet")
      // .attr("width", width + margin.left + margin.right + 2 * yLabelWidth)
      // .attr("height", height + margin.top + margin.bottom + 2 * xLabelHeight)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // array of all values in the data, for min maxing and length calculations
    const allValues = Array.prototype.concat.apply(
      [],
      data.map(function(d) {
        return d.hour_volumes;
      })
    );
    // finds longest array in data
    const maxWidth = d3.max(
      data.map(function(d) {
        return d.hour_volumes.length;
      })
    );
    // let yLabelWidth = width / maxWidth;

    // maximum radius for bubble.
    const maxR =
      d3.min([
        (width - yLabelWidth) / maxWidth,
        (height - xLabelHeight) / data.length
      ]) / 2;

    // let xLabelHeight = height / maxR;

    // sort data and translate into human-readable
    data.sort(function(a, b) {
     return parseInt(a["day_of_week"]) > parseInt(b["day_of_week"]);
    });

    data.push(data.shift());

    if (data[0]["day_of_week"].length === 1) {
      data = data.map(function(d) {
        d["day_of_week"] = localThis.getDayName(d["day_of_week"]);
        return d;
      });
    }

    // create labels
    const labelsX = this.labelsX;

    // calc total volumes per day, for sumsY label
    const sumsY = [];
    for (let i = 0; i < data.length; i++) {
      const sum = data[i]["hour_volumes"].reduce(function(acc, val) {
        return acc + val;
      }, 0);
      sumsY.push(sum);
    }

    // calc total volumes per hour, for sumsX label
    const sumsX = [];
    for (let i = 0; i < data[0]["hour_volumes"].length; i++) {
      const sum = data.reduce(function(acc, val) {
        return acc + val["hour_volumes"][i];
      }, 0);
      sumsX.push(sum);
    }

    // this essentially scales radius values according to the maxR
    const sizeScale = function(d, dataset) {
      if (d === 0) { return 0; }
      const f = d3.scaleSqrt()
        .domain([d3.min(dataset), d3.max(dataset)])
        .rangeRound([2, maxR - padding]);
      return f(d);
    };

    const colorScale = function(d, dataset) {
      const f = d3.scaleLinear()
        .domain([d3.min(dataset), d3.max(dataset)])
        .range([localThis.colors[7], localThis.colors[0]]);

      return f(d);
    };

    const colorScaleAxes = function(d, dataset) {
      const f = d3.scaleLinear()
        .domain([d3.min(dataset), d3.max(dataset)])
        .range(localThis.axisColors);
      return f(d);
    };

    // yAxis Border
    chart
      .append("rect")
      .attr("x", yLabelWidth)
      .attr("y", xLabelHeight + 2 * maxR)
      .attr("width", 2 * maxR)
      .attr("height", (height - 9.5) / 2)
      .attr("stroke-width", 2)
      .attr("stroke", "grey")
      .attr("fill", "transparent")
      .attr("shape-rendering", "crispEdges")
      .attr("class", "punch-border, border-right");
    // xAxis Border
    chart
      .append("rect")
      .attr("x", yLabelWidth + 2 * maxR)
      .attr("y", xLabelHeight)
      .attr("width", maxR * 24 * 2)
      .attr("height", 2 * maxR)
      .attr("stroke-width", 2)
      .attr("stroke", "grey")
      .attr("fill", "transparent")
      .attr("shape-rendering", "crispEdges")
      .attr("class", "punch-border, border-top");

    // creates rows according to data labels
      const rows = chart.selectAll(".row").data(data, function(d) {
        return d.day_of_week;
      })
      .enter()
      .append("g")
      .attr("class", "row")
      .attr("transform", function(d, i) {
        return (
          "translate(" +
          (yLabelWidth + 2 * maxR) +
          "," +
          (maxR * i * 2 + 3 * maxR + xLabelHeight) +
          ")"
        );
      });

    // creating the elements that will hold and represent our data
    rows.selectAll("circle")
      .data(function(d) {
        return d.hour_volumes;
      })
      .enter()
      .append("circle")
      .attr("cy", 0)
      .style("fill", "transparent")
      .text(function(d) {
        return d;
      })
      .attr("r", function(d) {
        return sizeScale(d, allValues);
      })
      .attr("cx", function(d, i) {
        return i * maxR * 2 + maxR;
      })
      .attr("shape-rendering", "auto")
      .style("fill", function(d) {
        return colorScale(d, allValues);
      });

    // adds labels
    const dotLabels = rows.selectAll(".dot-label").data(function(d) {
      return d.hour_volumes.map(function(v, idx) {
        return [v, d.day_of_week, idx];
      });
    })
      .enter()
      .append("g")
      .attr("class", "dot-label")
      .on("mouseover", function(d) {
        const selection = d3.select(this);
        if (d[0] > 0) {
          selection.style("cursor", "pointer");
        }
        selection
          .select("circle")
          .transition()
          .duration(100)
          .style("opacity", 1);
        selection
          .select("text")
          .transition()
          .duration(100)
          .style("opacity", 1);
      })

      .on("mouseout", function(d) {
        const selection = d3.select(this);
        selection.style("cursor", "default");
        selection
          .select("circle")
          .transition()
          .style("opacity", 0);
        selection
          .select("text")
          .transition()
          .style("opacity", 0);
      })
      .on("click", function(d, i) {
        localThis.clickEvent.emit(d);
      });


    dotLabels
      .append("circle")
      .attr("r", function(d) {
        return maxR;
      })
      .attr("cx", function(d, i) {
        return maxR;
        })
      .attr("cy", function(d, i) {
        return maxR;
      })
      .style("fill", localThis.colors[0])
      .style("opacity", 0);

    dotLabels
      .append("text")
      .style("text-anchor", "middle")
      .style("fill", "#ffffff")
      .style("opacity", 0)
      .style('font-size', 8);

    dotLabels.exit().remove();

    // centers and resizes the text so it doesn't exceed its rect
    dotLabels
      .attr("transform", function(d, i) {
        return "translate(" + i * maxR * 2 + "," + -maxR + ")";
      })
      .select("text")
      .text(function(d) {
        return d[0];
      })
      .attr("y", maxR + 4)
      .attr("x", maxR);

    // ensures the colored rect on the label is the width and height of the circle diameter (maxR * 2)
    dotLabels
      .select("rect")
      .attr("width", maxR * 2)
      .attr("height", maxR * 2);

    // creates labels for the x axis (hour)
    chart.selectAll(".xLabel")
      .data(labelsX)
    // styling for the labels
      .enter()
      .append("text")
      .attr("y", xLabelHeight)
      .attr("transform", "translate(0,-6)")
      .attr("class", "xLabel")
      .style("text-anchor", "middle")
      .style("fill-opacity", 0)
      .text(function(d) {
        return d;
      })
      .attr("x", function(d, i) {
        return maxR * i * 2 + 3 * maxR + yLabelWidth;
      })
      .style("fill-opacity", 1);

    // creates labels for the y axis (day of week)
    const yLabels = chart.selectAll(".yLabel")
      .data(data, function(d) {
        return d.day_of_week;
      })
    // y label creation
      .enter()
      .append("text")
      .text(function(d) {
        return d.day_of_week;
      })
      .attr("x", yLabelWidth)
      .attr("class", "yLabel")
      .style("text-anchor", "end")
      .style("fill-opacity", 0)
      .attr("y", function(d, i) {
        return maxR * i * 2 + 3 * maxR + xLabelHeight;
      })
      .attr("transform", "translate(-6," + maxR / 2.5 + ")")
      .style("fill-opacity", 1);

    // append sums to rows
    chart.selectAll(".sums-y")
      .data(sumsY)
      .enter()
      .append("circle")
      .text(function(d) {
        return d;
      })
      .attr("cy", 0)
      .attr("class", "sums-y")
      .style("fill", "#ffffff")
      .style("fill-opacity", 0)
      .attr("cy", function(d, i) {
        return maxR * i * 2 + 3 * maxR + xLabelHeight;
      })
      .attr("r", function(d) {
        return sizeScale(d, sumsY);
      })
      .attr("cx", yLabelWidth + maxR)
      .attr("shape-rendering", "auto")
      .style("fill", function(d) {
        return colorScaleAxes(d, sumsY);
      })
      .style("fill-opacity", 1)
      .style("stroke", "#9e9999")
      .style("stroke-width", 1);

    const sumsYValues = chart.selectAll(".sums-y-value").data(sumsY)
    // //adds mouseover transition
      .enter()
      .append("g")
      .attr("class", "sums-y-value")
      .on("mouseover", function(d) {
        const selection = d3.select(this);
        if (d > 0) {
          selection.style("cursor", "pointer");
        }
        selection
          .select("circle")
          .transition()
          .duration(0)
          .style("opacity", 1);
        selection
          .select("text")
          .transition()
          .duration(0)
          .style("opacity", 1);
      })
      .on("mouseout", function(d) {
        const selection = d3.select(this);
        selection.style("cursor", "default");
        selection
          .select("circle")
          .transition()
          .style("opacity", 0);
        selection
          .select("text")
          .transition()
          .style("opacity", 0);
      })
      .on("click", function(d, i) {
        const day = localThis.getDay(yLabels._groups[0][i].textContent);
        localThis.clickEvent.emit({day: day, total: d});
      });

    // creates the needed svg and text elements to make the labels actually readable
    sumsYValues
      .append("circle")
      .attr("r", function(d) {
        return maxR;
      })
      .attr("cx", function(d, i) {
        return maxR;
        })
      .attr("cy", function(d, i) {
        return maxR;
      })
      .style("fill", this.axisColors[1])
      .style("opacity", 0);

    sumsYValues
      .append("text")
      .style("text-anchor", "middle")
      .style("fill", "#ffffff")
      .style("opacity", 0)
      .style('font-size', 8);

    sumsYValues.exit().remove();

    // centers and resizes the text so it doesn't exceed its rect
    sumsYValues
      .attr("transform", function(d, i) {
        return (
          "translate(" +
          yLabelWidth +
          "," +
          (xLabelHeight + 2 * maxR + 2 * maxR * i) +
          ")"
        );
      })
      .select("text")
      .text(function(d) {
        return d;
      })
      .attr("y", maxR + 4)
      .attr("x", maxR);

    // ensures the colored rect on the label is the width and height of the circle diameter (maxR * 2)
    sumsYValues
      .select("rect")
      .attr("width", maxR * 2)
      .attr("height", maxR * 2);

    // create top label for y
    // chart
    //   .append("text")
    //   .attr("x", yLabelWidth)
    //   .attr("y", height + maxR * 2)
    //   .append("tspan")
    //   .attr("class", "sum-label-y")
    //   .style("text-anchor", "start")
    //   .text("Total/")
    //   .append("tspan")
    //   .attr("dy", 15)
    //   .attr("x", yLabelWidth)
    //   .text("Day")
    //   .attr("class", "sum-label-y")
    //   .style("text-anchor", "start");
    // x axis sums

    const sumsXAxis = chart.selectAll(".sums-x").data(sumsX);

    // styling for the labels
    sumsXAxis
      .enter()
      .append("circle")
      .text(function(d) {
        return d;
      })
      .attr("cy", 0)
      .attr("class", "sums-x")
      .style("fill", "#ffffff")
      .style("fill-opacity", 0)
      .attr("cy", xLabelHeight + maxR)
      .attr("r", function(d) {
        return sizeScale(d, sumsX);
      })
      .attr("cx", function(d, i) {
        return yLabelWidth + 3 * maxR + maxR * i * 2;
      })
      .attr("shape-rendering", "auto")
      .style("fill", function(d) {
        return colorScaleAxes(d, sumsX);
      })
      .style("fill-opacity", 1)
      .style("stroke", "#9e9999")
      .style("stroke-width", 1);

    const sumsXValues = chart.selectAll(".sums-x-value").data(sumsX)
    // //adds mouseover transition
      .enter()
      .append("g")
      .attr("class", "sums-x-value")
      .on("mouseover", function(d) {
        const selection = d3.select(this);
        if (d > 0) {
          selection.style("cursor", "pointer");
        }
        selection
          .select("circle")
          .transition()
          .duration(100)
          .style("opacity", 1);
        selection
          .select("text")
          .transition()
          .duration(100)
          .style("opacity", 1);
      })
      .on("mouseout", function(d) {
        const selection = d3.select(this);
        selection.style("cursor", "default");
        selection
          .select("circle")
          .transition()
          .style("opacity", 0);
        selection
          .select("text")
          .transition()
          .style("opacity", 0);
      })
      .on("click", function(d, i) {
        localThis.clickEvent.emit({hour: i, total: d});
      });

    // creates the needed svg and text elements to make the labels actually readable
    sumsXValues
      .append("circle")
      .attr("r", function(d) {
        return maxR;
      })
      .attr("cx", function(d, i) {
        return maxR;
        })
      .attr("cy", function(d, i) {
        return maxR;
      })
      .style("fill", this.axisColors[1])
      .style("opacity", 0);

    sumsXValues
      .append("text")
      .style("text-anchor", "middle")
      .style("fill", "#ffffff")
      .style("opacity", 0)
      .style('font-size', 8);

    sumsXValues.exit().remove();

    // centers and resizes the text so it doesn't exceed its rect
    sumsXValues
      .attr("transform", function(d, i) {
        return (
          "translate(" +
          (yLabelWidth + 2 * maxR * i + 2 * maxR) +
          ", " +
          xLabelHeight +
          ")"
        );
      })
      .select("text")
      .text(function(d) {
        return d;
      })
      .attr("y", maxR + 4)
      .attr("x", maxR);

    // ensures the colored rect on the label is the width and height of the circle diameter (maxR * 2)
    sumsXValues
      .select("rect")
      .attr("width", maxR * 2)
      .attr("height", maxR * 2);

    // create left label for sumsX
    // chart
    //   .append("text")
    //   .attr("x", width + 2 * maxR + 7)
    //   .attr("y", xLabelHeight + maxR / 2)
    //   .append("tspan")
    //   .attr("class", "sum-label-y")
    //   .style("text-anchor", "start")
    //   .text("Total/")
    //   .append("tspan")
    //   .attr("dy", 15)
    //   .attr("x", width + 2 * maxR + 7)
    //   .text("Hr")
    //   .attr("class", "sum-label-y")
    //   .style("text-anchor", "start");

    // draw in-chart light axes separating squares
    chart.selectAll(".vert")
      .data(labelsX)
      .enter()
      .append("line")
      .attr("class", "vert")
      .attr("stroke", "#888")
      .attr("stroke-width", 1)
      .style("shape-rendering", "crispEdges")
      .style("stroke-opacity", 0)
      .attr("x1", function(d, i) {
        return maxR * i * 2 + yLabelWidth + 2 * maxR;
      })
      .attr("x2", function(d, i) {
        return maxR * i * 2 + yLabelWidth + 2 * maxR;
      })
      .attr("y1", xLabelHeight + borderWidth / 2)
      .attr("y2", height - (maxR * 5) + 10)
      .style("stroke-opacity", function(d, i) {
        return i ? 0.5 : 0;
      });

    chart.selectAll(".horiz")
      .data(data, function(d) {
        return d.day_of_week;
      })
      .enter()
      .append("line")
      .attr("class", "horiz")
      .attr("x1", yLabelWidth + borderWidth / 2)
      .attr("stroke", "#888")
      .attr("stroke-width", 1)
      .style("shape-rendering", "crispEdges")
      .style("stroke-opacity", 0)
      .attr("x2", (maxR * 25 * 2) + yLabelWidth)
      .attr("y1", function(d, i) {
        return ((i + 1) * (maxR * 2)) + xLabelHeight;
      })
      .attr("y2", function(d, i) {
        return ((i + 1) * (maxR * 2)) + xLabelHeight;
      })
      .style("stroke-opacity", function(d, i) {
        return i ? 0.5 : 0;
      });

    // outer Border Bottom
    chart
      .append("line")
      .attr("x1", yLabelWidth + borderWidth / 2)
      .attr("y1", function(d, i) {
        return xLabelHeight / .34 + 1; // element.clientHeight - (maxR * 16) - xLabelHeight;
      })
      .attr("x2", maxR * 25 * 2 + yLabelWidth)
      .attr("y2", function(d, i) {
        return xLabelHeight / .34 + 1; // element.clientHeight - (maxR * 16) - xLabelHeight;
      })
      .attr("stroke-width", 3)
      .attr("shape-rendering", "crispEdges")
      .attr("stroke", "grey")
      .attr('class', 'punch-border');

    // outer border right
    chart
      .append("line")
      .attr("x1", function(d, i) {
        return (maxR * 25 * 2) + yLabelWidth; // +  width;
      })
      .attr("x2", function(d, i) {
        return (maxR * 25 * 2) + yLabelWidth; // + width;
      })
      .attr("y1", xLabelHeight + borderWidth / 2)
      .attr("y2", height - (maxR * 5) + 10)
      .attr("stroke-width", 2)
      .style("shape-rendering", "crispEdges")
      .attr("stroke", "grey")
      .attr('class', 'punch-border');

    // Emit ready event.
  }
}
