import { HostListener, Component, EventEmitter, Output, Input, OnChanges, SimpleChanges, AfterViewInit, AfterViewChecked } from '@angular/core';
import * as d3 from 'd3';
import { isEqual } from 'lodash';

@Component({
  selector: 'eikos-pie-chart',
  template: `
  <h2>{{title}}</h2>
  <div [ngStyle]="area" >
      <div [id]="propID" style="width:100%;height:100%"> </div>
  </div>
`
})
export class PieChartComponent implements OnChanges, AfterViewInit, AfterViewChecked {
  @Output() clickEvent = new EventEmitter<any>();
  @Input() propID = 'pie';
  @Input() data: Array<{}>;
  @Input() title: 'Pie Chart';
  @Input() colors = ["#081A4E", "#092369", "#1A649F", "#2485B4", "#2DA8C9", "#5DC1D0", "#9AD5CD", "#D5E9CB", "#64B5F6", "#01579B"];
  // need 10 hex colors;
  @Input() donutWidth: any = 0; // in pixels or %
  @Input() divHeight: any = "100%";
  @Input() divWidth: any = "100%";
  // note that if the donutWidth is too big, the pie chart will stretch outside the div area - HTK check for that
  savedColors = {};
  total = 0;
  givenHeight = this.divHeight;
  givenWidth = this.divWidth;
  @HostListener('window:resize', ['$event'])

  resizeEvent() {
    this.drawPieChart();
  }

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
  //     return {label: item.something, value: item.somethingElse};
  //   });
  // }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.data.firstChange && changes.colors && !isEqual(changes.colors.previousValue, changes.colors.currentValue)) {
      this.savedColors = {};
      this.drawPieChart();
    } else if (!changes.data.firstChange && changes.data && !isEqual(changes.data.previousValue, changes.data.currentValue) ) {
      this.drawPieChart();
    }
  }

  ngAfterViewInit() {
    this.drawPieChart();
  }

  ngAfterViewChecked() {
    const offsetHeight = document.querySelectorAll('#' + this.propID)[0]['offsetHeight'];
    const offsetWidth =  document.querySelectorAll('#' + this.propID)[0]['offsetWidth'];

    if (offsetHeight !== this.givenHeight || offsetWidth !== this.givenWidth) {
      this.givenHeight = offsetHeight;
      this.givenWidth = offsetWidth;
      this.drawPieChart();
    }
  }

  drawPieChart() {
    if (this.total === 0 && this.data) {
      this.data.forEach(el => {this.total += el['value']; });
    }

    d3.selectAll(`.${this.propID}_tooltip`).remove();
    const selection_string = "#" + this.propID;
    if (document.querySelectorAll(selection_string + " svg")[0] != null) {
      document.querySelectorAll(selection_string + " svg")[0].remove();
    }
    let element: any;
    const selected = document.querySelectorAll(selection_string);
    let colors: Array<String>;
    colors = this.colors;


    if (selected[0] == null) {
      element = {clientWidth: 500, clientHeight: 500};
    } else {
      element = selected[0];
    }

    function hex2rgb(hex) {
      return [<any>'0x' + hex[1] + hex[2] | 0, <any>'0x' + hex[3] + hex[4] | 0, <any>'0x' + hex[5] + hex[6] | 0];
    }

    const localThis = this;

    const margin = {top: 10, right: 0, bottom: 20, left: 0},
      width = element.clientWidth - margin.left - margin.right,
      height = element.clientHeight - margin.top - margin.bottom,
      radius = height > width ?  width / 2 : height / 2;
    let donutWidth = this.donutWidth;
    if (typeof donutWidth === "string") {
      donutWidth = (parseInt(donutWidth.split('%')[0]) / 100) * radius;
    } else if (radius < donutWidth) {
      donutWidth = (donutWidth / radius) * 10;
    }
    const svg = d3.select(selection_string)
      .append("svg")
      .data([this.data], function(d) {
        if (d) {
          return d.label;
        }
      })
      .attr("width", width)
      .attr("height", height)
      .append("g")
      // sets the center of the piechart to center of container
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // add tooltip div to the DOM
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", `d3_visuals_tooltip ${this.propID}_tooltip`)
      .style("opacity", 0);

    // create function that will be used to draw slices
    const pie = d3.pie()
      .value(function(d) { return d.value; });

    // Declare an arc generator function
    const arc = d3.arc()
      .innerRadius(donutWidth)
      .outerRadius(radius);

    // Select paths, use arc generator to draw
    const arcs = svg.selectAll("g.slice")
      .data(pie)
      .enter()
        .append("g")
        .attr("class", "slice");

  // adds total # of data values to the center of the pie
  if (this.donutWidth !== 0 && this.donutWidth !== "0%") {
    svg
        .append("text")
        .attr("class", "total")
        .attr("id", "centerText")
        .attr('font-size', '1em')
        .attr("transform", "translate(" + (-radius / 10) + "," + (radius / 13.75) + ")")
        .text(localThis.total);
        // this starts at cennter so the translate is back a few px and up a few px, gotta be a better way to calc HTK
  }

    // add tooltip on mouseover of slice
    arcs.on("mouseover", function(d) {
      // calculate the percent of total for the slice
      d3.select(this).selectAll('path').
        attr('fill', function(dt) {

            let currentFill = this.attributes.fill.value;
         currentFill = hex2rgb(currentFill);
        // if (currentFill.includes('#')){
        // } else {
        //   currentFill = currentFill.slice(0, currentFill.length -2).slice(4).split(', ')
        // }
        const darker = currentFill.map(item => {
// tslint:disable-next-line: radix
          return parseInt(item) * .75;
        });
        return `rgb(${darker[0]}, ${darker[1]}, ${darker[2]})`;

        });
      const percent = Math.round(d.data.value / localThis.total * 100);
      tooltip.transition()
        .duration(100)
        .style("opacity", 1);
      tooltip
        .html(
          d.data.label + ': ' + '<b>' + d.data.value + '</b>' + '<br/>' + '<b>' + percent + '</b>' + '% of total'
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px");

    })
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(300)
          .style("opacity", 0);

      d3.select(this).selectAll('path').
        attr('fill', function(dt) {
          const label = dt.data ? dt.data.label : dt.label;
          return localThis.savedColors[label];

        });
      })
      .on("click", function(d) {
        localThis.clickEvent.emit(d.data);
      });

    // add colors to each slice
    arcs.append("path")
      .attr("fill", function (d, i) {
        const length = colors.length;
        let color;
        if (localThis.savedColors[d.data.label]) {
          color = localThis.savedColors[d.data.label];
        } else {
          i >= length ? color = colors[i - length] : color = colors[i];
          localThis.savedColors[d.data.label] = color;

        }
        return color;
      })
      .attr("d", arc);


    // This is built in for smaller viewports
    // if the width is less than 800px then the legend won't be added
    // to the SVG the user is still able to hover or click on the pie
    // secion to see the label and value of the section
    // let localThis = this;
    if (width > 800) {
      const legend = svg.selectAll(".legend")
        .data(this.data, function(d) {
          return d.label;
        })
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(30," + 25 * i + ")"; });

      legend.append("rect")
        .attr("x", radius + 20)
        .attr("y", -radius + 20)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", function (d, i) {
            const length = colors.length;
            let color;
          if (localThis.savedColors[d.label]) {
            color = localThis.savedColors[d.label];
          } else {
            i >= length ? color = colors[i - length] : color = colors[i];
            localThis.savedColors[d.label] = color;

          }
          return color;

        })
        .attr("d", arc);

      legend.append("text")
        .attr("x", radius + 45)
        .attr("y", -radius + 30)
        .attr("dy", ".35em")
        .attr("font-size", 14)
        .style("text-anchor", "start")
        .text(function(d, i) {
          return localThis.data[i]["label"];
        });


        legend.on('mouseover', function(d) {
          const local = localThis;
          const currentLabel = d.label;
          d3.selectAll('g.slice path').data([d], function(dt) {
              return dt.data ? dt.data.label : dt.label;
          })
          .attr('fill', function(df) {
            if (df.label === currentLabel) {
              let currentFill = this.attributes.fill.value;
               currentFill = hex2rgb(currentFill);
              const darker = currentFill.map(item => {
// tslint:disable-next-line: radix
                return parseInt(item) * .75;
              });
              return `rgb(${darker[0]}, ${darker[1]}, ${darker[2]})`;
            } else {
              return ;
            }
          });
        });


        legend.on('mouseout', function(d) {
          const local = localThis;
          const currentLabel = d.label;
          d3.selectAll('g.slice path').data([d], function(dt) {
              return dt.data ? dt.data.label : dt.label;
          })
          .attr('fill', function(df) {
            return localThis.savedColors[df.label];
          });
        });
    }
  }
}
