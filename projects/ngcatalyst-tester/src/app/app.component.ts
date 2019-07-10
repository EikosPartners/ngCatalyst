import { Component } from '@angular/core';
const sunburstData = require('../assets/sunburstData.json');
const punchData = require('../assets/punchData.json');
const pieData = require('../assets/pieData.json');
const lineData = require('../assets/lineData.json');
const heatData = require('../assets/heatDataCal.json');
const heatData2 = require('../assets/heatData.json');
const bubbleData = require('../assets/bubbleData.json');
const barData = require('../assets/barData.json');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngcatalyst-tester';

  yAxisLabel = 'Thing Measured';
  xAxisLabelDate = 'Date of Thing';
  xAxisLabel = 'Quantity';
  falseVar = false;
  axisAngle = 25;

  barData = barData;
  barPropID = 'angularbar';
  barTitle = 'Bar Chart';
  barColor = '#57a71c';
  height = 500;
  width = 600;

  bubbleData = bubbleData;
  bbcData = [
    { x: 1, y: 1, label: "Value 1", value: 100 },
    { x: 4, y: 5, label: "Value 2", value: 150 },
    { x: 7, y: -3, label: "Value 3", value: 300 },
    { x: 12, y: 5, label: "Value 4", value: 200 },
    { x: 1, y: 33, label: "Value 5", value: 250 }
  ];
  bubblePropID = 'angularbubble';
  bubbleTitle = 'Bubble Chart';
  bubbleColors = ["#4F1E71", "#7C388E", "#A93B8D", "#BA5288", "#F38595", "#EDB7A7", "#F06292", "#C2185B"];
  bbcDivHeight = 300;
  bbcDivWidth = 400;

  heatData = heatData;
  heatData2 = heatData2;
  heatPropID = "heat2";
  xAxisAngle = "45";
  dataType = "other";

  lineData = lineData;
  linePropID = 'angularlines';
  lineTitle = 'Line Plot';
  lineColor = "#5c2197";
  plotPct = "25%";

  pieData = pieData;
  piePropID = 'angularpie';
  pieTitle = 'Pie Chart';
  pieColors = ["#081A4E", "#092369", "#1A649F", "#2485B4", "#2DA8C9", "#5DC1D0", "#9AD5CD", "#D5E9CB", "#64B5F6", "#01579B"];
  donutWidth = 150;

  punchData = punchData;
  punchPropID = 'angularpunch';
  punchTitle = 'Punch Card';
  punchColors =  ["#641E16", "#7B241C", "#922B21", "#A93226", "#C0392B", "#CD6155", "#D98880", "#E6B0AA", "#E57373", "#B71C1C"];
  axisColor = ["#FF6F00", "#FFD600"];

  sunburstData = sunburstData;
  sunburstPropID = "angularsunburst";
  sunburstTitle = 'Sunburst';





}
