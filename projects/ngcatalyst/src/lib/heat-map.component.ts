import { Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'eikos-heat-map',
  template: `
<h2>{{title}}</h2>
<div style="height: 300px; width: 900px;" >
    <div [id]="propID" style="width:100%;height:100%"> </div>
</div>
  `
})
export class HeatMapComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() dataType = "calendar"; // alternately, "other"
  @Input() title = "Heat Map";
  @Input() propID = 'heat';
  @Input() xAxisAngle = 0;
  @Input() alertText = "magnitude";
  @Input() data = [{}]; // {x: String, y: String, magnitude: Number} || {date: String, volume: Number} - can use dataModel getter/computer to reformat as needed
  @Input() colors = ["#081A4E", "#092369", "#1A649F", "#2485B4", "#2DA8C9", "#5DC1D0", "#9AD5CD", "#D5E9CB", "#64B5F6", "#01579B"]; // need 10 hex colors;

  constructor() {
  }

  ngOnInit() {
    this.draw();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.propID.firstChange) {
      this.draw();
    }
  }

  ngAfterViewInit() {
    this.draw();
  }

  get dataModel() {
    const returner = this.data.map(item=> {
      const newItem = {x: item['date'] ? item['date'] : item['x'], magnitude: item['volume'] ? item['volume'] : item['magnitude']};
      if (item['y']) {
        newItem['y'] = item['y'];
      }
      return newItem;
    }
    )
    returner.forEach(item=>{
      if (item.magnitude == undefined) {
        console.log(item)
        console.log(this.data)
        // console.log(this.data.filter(item=> item['date'] == item['x'] || item['x'] == item['x'] ))

      }
    })
    return returner
  }

  draw () {
    let data = this.dataModel.slice();
    const selection_string = "#" + this.propID;
    const component = this;
    const width = 900,
      height = 150,
      cellSize = 13; // cell size
    const week_days = [ ,"Mon", ,"Wed", ,"Fri"];
    // const week_days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
    const month = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    const localThis = this;
    const day = d3.timeFormat("%w"),
      week = d3.timeFormat("%U"),
      // percent = d3.format(".1%"),
      format = d3.timeFormat("%Y-%m-%d");
    const parseDate = d3.timeParse("%Y-%m-%d");

    let min_value = 9999;
    let max_value = 0;

    let x_elems, y_elems;
    // calendar, get the range of years to display
    if ( data !== undefined && data.length > 0 && localThis.dataType === 'calendar') {
      data.forEach(function(datum) {
        if (parseDate(datum['x']) == null) {debugger}

        const date_year = parseDate(datum['x']).getFullYear();
        min_value = date_year < min_value ? date_year : min_value;
        max_value = date_year > max_value ? date_year : max_value;
      });

      x_elems = month;
      y_elems = week_days;
    } else {
      // Get the range if not calendar.
      x_elems = d3.set(data.map( function (item) { return item['x']; })).values();
      y_elems = d3.set(data.map( function (item) { return item['y']; })).values();
    }

    d3.selectAll(`.${this.propID}_tooltip`).remove();
    if (document.querySelectorAll(selection_string + " svg")[0] != null) {
      document.querySelectorAll(selection_string + " svg")[0].remove();
    }


    const xScale = d3.scaleBand()
                  .domain(x_elems)
                  .range([0, x_elems.length * cellSize]);

    const yScale = d3.scaleBand()
                  .domain(y_elems)
                  .range([0, y_elems.length * cellSize]);

    const svg = d3
      .select(selection_string)
      .selectAll("svg")
      .data(this.dataType === 'calendar' ? d3.range(min_value, max_value + 1) : [0])
      .enter()
      .append("svg")
      .attr("width", "100%")
      .attr("data-height", "0.5678")
      .attr("viewBox", "0 0 900 300")
      .attr("preserveAspectRatio", "xMaxYMax meet")
      // http://tutorials.jenkov.com/svg/svg-viewport-view-box.html
      // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
      // http://jonibologna.com/svg-viewbox-and-viewport/
      .attr("class", "RdYlGn")
      // .style('fill', 'black')
      .append("g")
      .attr(
        "transform",
        "translate(100,100)"
      );

    svg
      .append("text")
      .attr("transform", "translate(-38," + cellSize * 3.5 + ")rotate(-90)")
      .style("text-anchor", "middle")
      .text(function(d) {
        if (this.dataType === "calendar") { return d; }
      });

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", `d3_visuals_tooltip ${this.propID}_tooltip`)
      .style("opacity", 0);

    // "y" axis values
    for (let i = 0; i < y_elems.length; i++) {
      svg
        .append("text")
        .style("font-size", "12px")
        .attr("transform", "translate(-5," + cellSize * (i + 1) + ")")
        .style("text-anchor", "end")
        .attr("dy", "-.25em")
        .text(function(d) {
          return y_elems[i];
        });
    }

    // "magnitudes"
    const rect = svg
      .selectAll(".day")
      .data(function(d) {
        if (localThis.dataType === 'calendar') {
          return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1));
        } else {
          return data;
        }
      })
      .enter()
      .append("rect")
      .attr("stroke-width", ".5")
      .attr("class", "day")
      .style("font-size", "12px")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", function(d, i) {
        if (localThis.dataType === 'calendar') {
          return week(d) * cellSize;
        } else {
          // return xScale(d.x)
          return xScale(d.x);
        }
      })
      .attr("y", function(d, i) {
        if (localThis.dataType === 'calendar') {
          return day(d) * cellSize;
        } else {
          return yScale(d.y);
        }
      })
      .attr("fill", 'white');

    if (this.dataType === 'calendar') {
      rect.datum(format);
    }
    // "x" axis values
    const legend = svg
      .selectAll(".legend")
      .data(x_elems)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) {
        if (localThis.dataType === 'calendar') {
          return "translate(" + ((i + 1) * 53) + ",0)";
        } else {
          let size = i * cellSize;
          if (localThis.xAxisAngle < 0 || localThis.xAxisAngle === 270) {
            size += 13;
          }

          return "translate(" + size + ",0)";
        }

      })
      .append("text")
      .attr("class", function(d, i) {
        return x_elems[i];
      })
      .style("text-anchor", `${(localThis.xAxisAngle < 0 || localThis.xAxisAngle === 270) ? 'start' : 'end'}`)
      .attr("transform", `rotate(${localThis.xAxisAngle})`)
      .attr("dy", "-.25em")
      .style("font-size", "12px")
      .text(function(d, i) {
        return x_elems[i];
      });

    svg
      .selectAll(".month")
      .data(function(d) {
        return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1));
      })
      .enter()
      .append("path")
      .attr("class", "month");
      // .attr("id", function(d, i) {
      //   return month[i];
      // })
      // .attr("d", this.monthPath);

    // data
    const count_Max = d3.max(data, function(d) {
        return d.magnitude;
    });

    const maxColor = this.colors[7];
    const color = d3.scaleLinear()
      .range([localThis.colors[6], localThis.colors[0]])
      .domain([0, 1]);


    const ndata = d3
      .nest()
      .key(function(d) {
        return d.x;
      })
      .rollup(function(d) {
        if (localThis.dataType === 'calendar') {
          return Math.sqrt(d[0].magnitude / count_Max);
        } else {
          return d[0].magnitude;
        }
      })
      .map(data);

    // Filling in the boxes with data.
    rect
      .attr('stroke', 'black')
      .filter(function(d) {
        if (localThis.dataType === 'calendar') {
          return ('$' + d in ndata) && (ndata['$' + d] !== 0);
        } else {
          return ('$' + d.x in ndata) && (ndata['$' + d] !== 0);
        }
      })
      .attr("class", "hasData")
      .attr("fill", function(d) {
        if (localThis.dataType === 'calendar') {
          return color(ndata['$' + d]);
        } else {
          return color(d.magnitude);
        }

      })
      .attr("data-title", function(d) {
        return localThis.alertText + " : " + ndata[d];
      })
      .on("mouseover", function (d) {
        if (typeof d === 'string') {
          d = { x: d };
        }

      const item = localThis.dataModel.filter(function(item) {
        return item['x'] === d.x;
      })[0];

      let tooltipText = "Occurrences: " + "<b>" + item['magnitude'] + "</b>" + "<br>X: " + "<b>" + d.x + "</b></br>";

      if (d.y) {
        tooltipText += "<b>Y: " + d.y + "</b>";
      }

      tooltip
        .html(tooltipText)
        .style("left", d3.event.pageX + 5 + "px")
        .style("top", d3.event.pageY - 28 + "px");

      tooltip
        .transition()
        .duration(100)
        .style("opacity", 1);

      d3
        .select(tooltip[0])
        .transition()
        .duration(50)
        .style("opacity", 1);
        d3
          .select(this)
          .transition()
          .duration(50)
          .attr("fill", maxColor);
      })
      .on("mouseout", function(d) {
        d3
          .select(this)
          .transition()
          .duration(100)
          .attr("fill", function(d) {
            if (localThis.dataType === 'calendar') {
              return color(ndata['$' + d]);
            } else {
              return color(d.magnitude);
            }
          });
        tooltip
          .transition()
          .duration(300)
          .style("opacity", 0);
      });

  }
  // numberWithCommas (x) {
  //   x = x.toString();
  //   const pattern = /(-?\d+)(\d{3})/;
  //   while (pattern.test(x)) { x = x.replace(pattern, "$1,$2"); }
  //   return x;
  // }

  // monthPath (t0) {
  //   const day = d3.timeFormat("%w");
  //   const week = d3.timeFormat("%U");
  //   const cellSize = 12; // cell size

  //   const t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
  //     d0 = +day(t0),
  //     w0 = +week(t0),
  //     d1 = +day(t1),
  //     w1 = +week(t1);
  //   return (
  //     "M" +
  //     (w0 + 1) * cellSize +
  //     "," +
  //     d0 * cellSize +
  //     "H" +
  //     w0 * cellSize +
  //     "V" +
  //     7 * cellSize +
  //     "H" +
  //     w1 * cellSize +
  //     "V" +
  //     (d1 + 1) * cellSize +
  //     "H" +
  //     (w1 + 1) * cellSize +
  //     "V" +
  //     0 +
  //     "H" +
  //     (w0 + 1) * cellSize +
  //     "Z"
  //   );
  // }

}
