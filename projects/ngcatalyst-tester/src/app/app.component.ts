import { Component } from '@angular/core';
const sunburstData = require('../assets/sunburstData.json');
const punchData = require('../assets/punchData.json');
const pieData = require('../assets/pieData.json');
const lineData = require('../assets/lineData.json');
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
  axisAngle = 45;

  barData = barData;
  barPropID = 'angularbar';
  barTitle = 'Bar Chart';
  barColor = '#57a71c';

  bubbleData = bubbleData;
  bubblePropID = 'angularbubble';
  bubbleTitle = 'Bubble Chart';
  bubbleColors = ["#4F1E71", "#7C388E", "#A93B8D", "#BA5288", "#F38595", "#EDB7A7", "#F06292", "#C2185B"];

  lineData = lineData;
  linePropID = 'angularlines';
  lineTitle = 'Line Plot';
  lineColor = "#5c2197";

  pieData = pieData;
  piePropID = 'angularpie';
  pieTitle = 'Pie Chart';
  pieColors = ["#081A4E", "#092369", "#1A649F", "#2485B4", "#2DA8C9", "#5DC1D0", "#9AD5CD", "#D5E9CB", "#64B5F6", "#01579B"];
  donutWidth = 250;

  punchData = punchData;
  punchPropID = 'angularpunch';
  punchTitle = 'Punch Card';
  punchColors =  ["#641E16", "#7B241C", "#922B21", "#A93226", "#C0392B", "#CD6155", "#D98880", "#E6B0AA", "#E57373", "#B71C1C"];
  axisColor = ["#FF6F00", "#FFD600"];

  sunburstData = sunburstData;
  sunburstPropID = "angularsunburst";
  sunburstTitle = 'Sunburst';





}
