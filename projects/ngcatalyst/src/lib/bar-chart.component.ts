import { Component, Input, OnChanges, SimpleChanges, AfterViewInit} from '@angular/core';
import * as d3 from 'd3';
import { isEqual, zip, zipObject } from 'lodash';

@Component({
  selector: 'eikos-bar-chart',
  template: `
  <h2>{{title}}</h2>
    <div [ngStyle]="area" >
      <div [id]="propID" style="width:100%;height:100%">
      </div>
    </div>
  `
})

export class BarChartComponent implements OnChanges, AfterViewInit {
  @Input() data: Array<{}>;
  @Input() propID = 'barchart';
  @Input() color = '#2DA8C9';
  @Input() colors = ["#9400D3", "#4B0082", "#0000FF", "#00FF00", "#FFFF00", "#FF7F00", "#FF0000"];
  @Input() yAxisLabel = 'y';
  @Input() xAxisLabel = 'x';
  @Input() xAxisAngle = 45;
  @Input() yAxisAngle = 45;
  @Input() title = "Bar Chart";
  @Input() divHeight: any = "100%"; // for a % you need a container div with a non-% height and width;
  @Input() divWidth: any = "100%";

  constructor() { }

  get dataModel() {
    if (this.data[0]["name"]) {
      return this.data.map(item => {
        return {x: item["name"], y: item["value"]};
      });
    } else if (this.data[0]["x"]) {
      return this.data;
    }
  }
  get dataColors() {
    if (typeof this.colors[0] !== "string") {
      return this.colors;
    } else {
      let dataColors, localColor;
      if (this.colors.length < this.data.length) {
        localColor = this.colors.concat(this.colors).slice(0, this.data.length);
      } else {
        localColor = this.colors;
      }
      dataColors = zipObject(this.dataModel.map(item => item["x"]), localColor);
      return dataColors;
    }

  }

  get area () {
    let height, width;
    if (typeof this.divHeight === "number") {
      height = this.divHeight + "px";
      width = this.divWidth + "px";
    } else {
      height = this.divHeight;
      width = this.divWidth;
    }
    return {height: height, width: width};
  }


  ngAfterViewInit() {
    this.drawBarPlot(this.dataModel, this.propID, this.yAxisLabel, this.xAxisLabel, this.mouseover_callback);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && !changes.data.firstChange && !isEqual(changes.data.previousValue, changes.data.currentValue)) {
      this.drawBarPlot(this.dataModel, this.propID, this.yAxisLabel, this.xAxisLabel, this.mouseover_callback);
    }
  }

  mouseover_callback(x) {
      return x;
  }

  drawBarPlot (data, id, yaxisvalue, xaxisvalue, mouseover_callback) {
        const localThis = this;
        d3.selectAll(`.${this.propID}_tooltip`).remove();

        const selection_string = "#" + id;
        if (document.querySelectorAll(selection_string + " svg")[0] != null) {
          document.querySelectorAll(selection_string + " svg")[0].remove();
        }

        let element: any;
        const selected = document.querySelectorAll(selection_string);

        if (selected[0] == null) {
          element = {clientWidth: 500, clientHeight: 500};
        } else {
          element = selected[0];
        }
        const margin = { top: 20, right: 30, bottom: 15, left: 40 };
        if (this.xAxisAngle > 0) {
          margin.bottom += (this.xAxisAngle / 2);
        }
        const width = element.clientWidth - margin.left - margin.right;
        let height = element.clientHeight - margin.top - margin.bottom;
        if (this.title) {
          height = height - 48;
        }
        const dataValues = this.dataModel.map(item => item["y"]);
        const dataNames = this.dataModel.map(item => item["x"]);
        const x = d3.scaleBand()
          .range([0, width])
          .domain(dataNames)
          .paddingInner(.2)
          .paddingOuter(.2);

        let extent = d3.extent(dataValues).reverse();
        // extent = extent.reverse();
        // console.log(extent);
        // console.log(dataValues);
        const y = d3.scaleLinear()
          .range([0, height - margin.bottom])
          .domain(extent);

        const xAxis = d3.axisBottom()
          .scale(x)
          .tickSizeOuter(0);

        const yAxis = d3.axisLeft()
          .scale(y)
          .tickSizeInner(-width);

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
          .attr("class", "x axis xaxis")
          .attr("transform", "translate(0," + (height - margin.bottom) + ")")
          .call(xAxis)
          .append("text")
          .attr("class", "label x-label")
          .attr("x", (width / 3) + margin.right)
          .attr("y", 0)
          .style("text-anchor", "middle")
          .text(xaxisvalue);

        const text = chart.selectAll("text");

        if (this.xAxisAngle > 0) {
            text
                .attr("transform", `rotate(${this.xAxisAngle}) translate(0, ${margin.top})`)
                .style("text-anchor", "middle");

            const dimensions = text.node().getBBox();
            const array = Array.from(text._groups[0]).map((item: any, index: number) => item.getBBox().width);
            // const dimwid = d3.max(array);

            if (this.xAxisAngle < 45) {
              text.attr("x", function(a, b, c, d) {
                    if (array[b] < margin.bottom) {
                      return dimensions.width / 2;
                    } else {
                      return dimensions.width / 1.5;
                    }
                  })
                  .attr("y", dimensions.height - margin.top);
            }

            if (this.xAxisAngle >= 45) {
              text.attr("x", function(a, b, c, d) {
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
        const dataColors = this.dataColors;
        chart
          .append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 0)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text(yaxisvalue);

          function hex2rgb(hex) {
            // tslint:disable-next-line:no-bitwise
            return [<any>'0x' + hex[1] + hex[2] | 0, <any>'0x' + hex[3] + hex[4] | 0, <any>'0x' + hex[5] + hex[6] | 0];
          }

        if (data.length > 0) {
          chart
            .selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {
              return x(d.x);
            })
            .attr("y", function(d) {
              if (d.y < 0) {
                return y(0);
              } else {
                return y(d.y);
              }
            })
            .attr("height", function(d) {
              if (dataValues.every(it => it > 0)) {
                return height - y(d.y) - margin.bottom;
              } else {
                return Math.abs(y(d.y) - y(0));
              }
            })
            .attr("width", x.bandwidth() - x.paddingInner())
            .style("fill", function(d, i, c){
              return dataColors[d["x"]];
            })
            .on("mouseover", function(d) {
              const yval = mouseover_callback(d.y);
              tooltip
                .transition()
                .duration(100)
                .style("opacity", 1);
              tooltip
                .html(
                  xaxisvalue +
                    ": <b>" +
                    d.x + "</b><br>" +
                  yaxisvalue +
                    ": <b>" +
                    yval + "</b>"
                )
                .style("left", d3.event.pageX + 5 + "px")
                .style("top", d3.event.pageY - 28 + "px");
              d3
                .select(this)
                .transition()
                .duration(50)
                .style("fill", function(dt, i) {

                  let currentFill: any;
                  currentFill = hex2rgb(dataColors[dt["x"]]);
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
            })
            .on("mouseout", function(d) {
              d3
                .select(this)
                .transition()
                .duration(100)
                .style("fill", function(d, i) {
                   return dataColors[d["x"]];
                });
              tooltip
                .transition()
                .duration(300)
                .style("opacity", 0);
            });
        }
  }

}
