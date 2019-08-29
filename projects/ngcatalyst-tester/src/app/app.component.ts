import { Component, OnInit, HostListener, ViewChild, ViewContainerRef,
  ElementRef,  QueryList,  ViewChildren, TemplateRef } from '@angular/core';
const sunburstDataJson = require('../assets/sunburstData.json');
const punchDataJson = require('../assets/punchData.json');
const pieDataJson = require('../assets/pieData.json');
const lineDataJson = require('../assets/lineData.json');
const lineDataJsonB = require('../assets/lineDataTimes.json');

const heatDataJson = require('../assets/heatDataCal.json');
const heatData2Json = require('../assets/heatData.json');
const bubbleDataJson = require('../assets/bubbleData.json');
const barDataJson = require('../assets/barData.json');
import { RandomNumberService} from './random-number.service';
import { shuffle, zipObject } from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private randomNumberService: RandomNumberService) {
    // window.onresize = this.rerender.bind(this);
  }
  @ViewChildren('c', {read: ElementRef}) childComps: QueryList<ElementRef>;
  @ViewChild('vc', {read: ViewContainerRef}) viewContainer: ViewContainerRef;
  @ViewChild(TemplateRef) template: TemplateRef<null>;


  title = 'ngcatalyst-tester';

  yAxisLabel = 'Thing Measured';
  xAxisLabelDate = 'Date of Thing';
  xAxisLabel = 'Quantity';
  falseVar = false;
  axisAngle = 25;
  plotPct = "200%";
  hundoPct = "100%";
  fiftyPct = "50%";
  margin = {};
  anObject: Array<{}> = [{foo: "bar", baz: 12, thing: "one", thang: 2}, {bar: "basz", one: 123, ought: "b", why: "not"}];
  randomNumber = this.randomNumberService.randomNumber;
  barData = barDataJson;
  barDataA = this.barData.map(item => item.name).map(item2 => {
    return {x: item2, y: this.randomNumber(-10000, 20000, true)};
  });

  barPropID = 'angularbar';
  barTitle = 'Bar Chart';
  height = 500;
  width = 600;

  bubbleData = bubbleDataJson;
  bubbleData2 = this.bubbleData.map(item => item.label).map(item2 => {
    return {x: this.randomNumber(0, 2, false), y: this.randomNumber(20, 90, false), label: item2, value: this.randomNumber(1, 15, true)};
  });
  bubblePropID = 'angularbubble';
  bubbleTitle = 'Bubble Chart';
  bubbleColors = ["#4F1E71", "#7C388E", "#A93B8D", "#BA5288", "#F38595", "#EDB7A7", "#F06292", "#C2185B"];
  bbcDivHeight = 300;
  bbcDivWidth = 200;

  heatData = heatDataJson;
  heatData2 = heatData2Json;
  heatColors = this.bubbleColors;
  heatPropID = "heat2";
  xAxisAngle = "45";
  dataType = "other";

  lineData = lineDataJson;
  lineDataB = lineDataJsonB;
  lineType = "Time";
  lineDataA = this.lineData.map(item => item.date).map(item2 => {
    return {date: item2, value: this.randomNumber(-10000, 20000, true)};
  });
  linePropID = 'angularlines';
  lineTitle = 'Line Plot';
  lineColors = ["purple", "orange"];
  threshold = 0;

  pieData = pieDataJson;
  pieData2 = this.pieData.map(item => item.label).map(item2 => {
    return {label: item2, value: this.randomNumber(0, 30000, true)};
  });
  piePropID = 'angularpie';
  pieTitle = 'Pie Chart';
  pieColors = ["#081A4E", "#092369", "#1A649F", "#2485B4", "#2DA8C9", "#5DC1D0", "#9AD5CD", "#D5E9CB", "#64B5F6", "#01579B"];
  donutWidth = 100;
  donutWidthPct = "10%";

  punchData = punchDataJson;
  punchData2 = this.punchData.map(item => item["day_of_week"]).map(item2 => {
    return {"day_of_week": item2, "hour_volumes": Array.apply(null, Array(24)).map(item => this.randomNumber(1, 11, true))};
  });

  punchPropID = 'angularpunch';
  punchTitle = 'Punch Card';
  punchColors =  ["#641E16", "#7B241C", "#922B21", "#A93226", "#C0392B", "#CD6155", "#D98880", "#E6B0AA", "#E57373", "#B71C1C"];
  axisColor = ["#FF6F00", "#FFD600"];
  barColors = zipObject(this.barData.map(item => item.name), this.punchColors);

  showMe = true;
  sunburstData = sunburstDataJson;
  sunburstData2 = this.metaCollect(this.sunburstData);
  sunburstPropID = "angularsunburst";
  sunburstTitle = 'Sunburst';
  @HostListener('window:resize', ['$event'])

  onResize(event) {
    this.showMe = false;
    console.log("Width: " + event.target.innerWidth);
    const localThis = this;
    const equation = () => localThis.showMe = true;
    setTimeout(equation, 1);
    console.log(this.showMe);
  }


  ngOnInit() {
    this.viewContainer.createEmbeddedView(this.template);
  }
  rerender() {
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(this.template);
    // this.showMe = false;
    // const localThis = this;
    // const equation = () => localThis.showMe = true;
    // setTimeout(equation, 500);
  }

  metaCollect(obj) {
    const collector = [];
    obj.forEach((item, index) => {
      const subject = {"name": item["name"]};
      if (item["children"]) {
        subject["children"] = this.metaCollect(item["children"]);
      } else {
        subject["size"] = this.randomNumber(500, 20000, true);
      }
      collector.push(subject);
    });
    const names = this.shuffleMap(collector, "name");
    const sizes = this.shuffleMap(collector, "size");

    let kids = [];
    if (collector.some(i2 => i2["children"])) {
      kids = this.shuffleMap(collector, "children");
    }

    const randomized = [];
    names.forEach((item, index, arr) => {
      const subtree = {name: item};
      if (kids.length > 0) {
        subtree["children"] = kids[index];
      }
      if (collector.some(i2 => i2["name"] === item)) {
        subtree["size"] = sizes[index];
      }
      randomized.push(subtree);
    });

    return randomized;
  }

  shuffleMap(arr, arg) {
    return shuffle(arr.map(item => item[arg]));
  }

  clickEventEmit (data) {
    console.log(data);
  }

  onclickfn () {
    this.barData = this.barData.map(item => item.name).map(item2 => {
      return {name: item2, value: this.randomNumber(0, 30000, true)};
    });
    this.bubbleData = this.bubbleData.map(item => item.label).map(item2 => {
      return {x: this.randomNumber(0, 2, false), y: this.randomNumber(20, 90, false), label: item2, value: this.randomNumber(1, 15, true)};
    });
    this.heatData = this.heatData.map(item => item.date).map(item2 => {
      return {date: item2, volume: this.randomNumber(0, 30, true)};
    });
    // this.heatData2 = this.heatData.map(item => item.date).map(item2=>{
    //   return {date: item2, volume: this.randomNumber(0, 30, true)};
    // });
    // this.dataType = "calendar";
    this.lineData = this.lineData.map(item => item.date).map(item2 => {
      return {date: item2, value: this.randomNumber(-5000, 10000, true)};
    });
    this.pieData = this.pieData.map(item => item.label).map(item2 => {
      return {label: item2, value: this.randomNumber(0, 30000, true)};
    });
    this.punchData = this.punchData.map(item => item["day_of_week"]).map(item2 => {
      return {"day_of_week": item2, "hour_volumes": Array.apply(null, Array(24)).map(item => this.randomNumber(1, 11, true))};
    });
    // this.punchColors = this.pieColors;
    this.sunburstData = this.metaCollect(this.sunburstData);
  }
}
