import { Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, AfterViewChecked } from '@angular/core';
import * as d3 from 'd3';
import { isEqual } from 'lodash';

@Component({
  selector: 'eikos-sunburst',
  template: `
  <h2>{{title}}</h2>
  <div [ngStyle]="area" >
      <div [id]="propID" style="width:100%;height:100%"> </div>
  </div>
`
})
export class SunburstComponent implements OnInit, OnChanges, AfterViewInit, AfterViewChecked {

  @Input() propID = 'burst';
  @Input() data: [{name: string, children: [{name: string, size: number}, {name: string, children: []}]}];
  @Input() title: string;
  @Input() divHeight: any = "100%";
  @Input() divWidth: any = "100%";
  // htk it seems that when one is bigger than the other that affects posiitioning in the div instead of actual size

  resizeEvent(ev) {
  }

  constructor() {
    window.onresize = this.drawSunburst.bind(this);
  }

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
    // this.drawSunburst();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && !changes.data.firstChange && !isEqual(changes.data.previousValue, changes.data.currentValue)) {
      this.drawSunburst();
    }
  }

  ngAfterViewInit() {
    this.drawSunburst();
  }

  ngAfterViewChecked() {
    this.drawSunburst();
  }

  drawSunburst() {
        // let localThis = this;
        d3.selectAll(`.${this.propID}_tooltip`).remove();
        const selection_string = "#" + this.propID;
        if (document.querySelectorAll(selection_string + " svg")[0] != null) {
          document.querySelectorAll(selection_string + " svg")[0].remove();
        }
        let element: any;
        const selected = document.querySelectorAll(selection_string);

        if (selected[0] == null) {
          element = [{clientWidth: 500, clientHeight: 500}];
        } else {
          element = selected[0];
        }

        const	width = element.clientWidth;
        let	height = element.clientHeight;

        // Account for panel heading height if it exists.
        // if (this.title) {
        //   height -= 40;
        // }

        if ( height === undefined || height === 0 ) {
          height = width / 4;
        }

        const radius = Math.min(width, height) / 2;
        const color = d3.scaleOrdinal(d3.schemePaired);

        const formatNumber = d3.format(",d");

        const x = d3.scaleLinear()
            .range([0, 2 * Math.PI]);

        const y = d3.scaleSqrt()
            .range([0, radius]);

        const partition = d3.partition();

        const arc = d3.arc()
            .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
            .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
            .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
            .outerRadius(function(d) { return Math.max(0, y(d.y1)); });


        const svg = d3.select(selection_string).append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", `d3_visuals_tooltip ${this.propID}_tooltip`)
            .style("opacity", 0);

        const root = d3.hierarchy(this.data[0]);
        root.sum(function(d) { return d.size; });
        const nodes = partition(root).descendants();

        svg.selectAll("path")
            .data(nodes)
          .enter().append("path")
            .attr("d", arc)
            .attr('class', 'segment')
            .style("fill", function(d) { return color((d.children ? d : d.parent).data.name); })
            .on("click", function(d) {
              click(d);
            })
            .on("mouseover", function(d) {
              tooltip.transition()
                .duration(100)
                .style("opacity", 1);
              tooltip
                .html(
                   "Name: " + d.data.name + "<br/>" +  (d.data.size ? "Value: " + d.data.size : "")
                )
                .style("left", d3.event.pageX + 5 + "px")
                .style("top", d3.event.pageY - 28 + "px");
            })
            .on("mouseout", function(d) {
              tooltip.transition()
                .duration(300)
                .style("opacity", 0);
            })
          .append("title")
            .text(function(d) { return d.data.name + "\n" + formatNumber(d.value); });



        function click(d) {
          svg.transition()
              .duration(750)
              .tween("scale", function() {
                const xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                    yd = d3.interpolate(y.domain(), [d.y0, 1]),
                    yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
                return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
              })
            .selectAll("path")
              .attrTween("d", function(d2) { return function() { return arc(d2); }; });
        }

        d3.select(self.frameElement).style("height", height + "px");

  }
}
