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
import { isEqual, zip, zipObject } from "lodash";

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
export class BarChartComponent
  implements OnChanges, AfterViewInit, AfterViewChecked {
  @Output() clickEvent = new EventEmitter<any>();
  @Input() data: Array<{}>;
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
  @Input() marker: Number = 0;
  @Input() markerColor: String = "#000"; //default is black
  @Input() markerWidth: String = "1"; //default thickness of marker line
  @Input() marginTop: number = 50;
  @Input() marginRight: number = 50;
  @Input() marginBottom: number = 50;
  @Input() marginLeft: number = 50;

  givenHeight = this.divHeight;
  givenWidth = this.divWidth;

  constructor() {
    window.addEventListener("resize", this.drawBarPlot.bind(this));
  }

  get dataModel() {
    if (this.data[0]["name"]) {
      return this.data.map(item => {
        return { x: item["name"], y: item["value"] };
      });
    } else if (this.data[0]["x"]) {
      return this.data;
    }
  }

  get dataColors() {
    if (typeof this.colors[0] !== "string") {
      return this.colors;
    } else {
      let dataColors,
        localColor = [];
      if (this.colors.length < this.data.length) {
        while (localColor.length < this.data.length) {
          localColor = localColor.concat(this.colors);
        }
      } else {
        localColor = this.colors;
      }
      dataColors = zipObject(this.dataModel.map(item => item["x"]), localColor);
      return dataColors;
    }
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
    const data = this.dataModel,
      id = this.propID,
      yaxisvalue = this.yAxisLabel,
      xaxisvalue = this.xAxisLabel;
    const localThis = this;
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

    const dataValues = this.dataModel.map(item => item["y"]);
    const dataNames = this.dataModel.map(item => item["x"]);
    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(dataNames)
      .paddingInner(0.2)
      .paddingOuter(0.2);

    const extent = d3.extent(dataValues).reverse();
    const y = d3
      .scaleLinear()
      .range([0, height])
      .domain(extent);

    const xAxis = d3
      .axisBottom()
      .scale(x)
      .tickSizeOuter(0);

    const yAxis = d3.axisLeft().scale(y);

    if (this.showTicks) {
      yAxis.tickSizeInner(-width);
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

    const dataColors = this.dataColors;

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
            return height - y(d.y);
          } else {
            return Math.abs(y(d.y) - y(0));
          }
        })
        .attr("width", x.bandwidth() - x.paddingInner())
        .style("fill", function(d, i, c) {
          return dataColors[d["x"]];
        })
        .on("mouseover", function(d) {
          const yval = d.y;
          tooltip
            .transition()
            .duration(100)
            .style("opacity", 1);
          tooltip
            .html(
              xaxisvalue +
                ": <b>" +
                d.x +
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
              currentFill = hex2rgb(dataColors[dt["x"]]);
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
            .style("fill", function(d2, i) {
              return dataColors[d2["x"]];
            });
          tooltip
            .transition()
            .duration(300)
            .style("opacity", 0);
        })
        .on("click", function(d) {
          localThis.clickEvent.emit(d);
        });

      if (this.marker) {
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
}
