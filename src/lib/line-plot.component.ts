import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewContainerRef
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import * as d3 from 'd3';
import { isEqual, flatten } from 'lodash';

@Component({
  selector: 'eikos-line-plot',
  providers: [DecimalPipe],
  template: `
    <!--   <ng-container #vc></ng-container> -->
    <div [ngStyle]="area">
      <!-- <ng-template> -->
      <div [id]="propID" style="width:100%;height:100%"></div>
    </div>
    <!-- </ng-template>-->
  `
})
export class LinePlotComponent implements OnChanges, AfterViewInit, AfterViewChecked {
  @Output() clickEvent = new EventEmitter<any>();
  @Input() propID = 'line';
  @Input() data: Object; // {"line data label": [{date: string, value: number}]} Data should be an object, each key will be a label for the dataset and line. The value of the key should be an array of objects (array like the data array that the line plot used to take). each of these objects is a data point
  /* {
      "Company 1": [
        { "date": "11-15-2019", "value": 200}, ...
      ],
      "Company 2": [
        { "date": "11-15-2019", "value": 150}, ...
      ], ...
    }
    The x axis scale does not have to be the same between the datasets. For example "Company 1" data could go to cover just the month of November, and "Company 2" data could cover October and November
    The key for the X axis does not have to be date or time anymore, the component will now infer what the key is
    The key for the Y axis MUST be "value".
      Example datapoint: {"anyStringYouWant": "11-15-2019", "value": 14}
    */

  @Input() thresholdColors = ['#1e9552', 'red']; // these are the colors that will be used for the threshold if it is passed. Only used if the threshold value is passed
  @Input() lineColors; // Array of color strings to be used for the lines or Object mapping dataset keys with color strings.
  /* If an Array is passed then the colors will be matched in order of the keys of the data Object (order is not guaranteed). 
     If an Object is used then format should be like this 
     {
       "Company 1": "blue",
       "Company 2": "red", 
       ...
     } 
     The key must match the data key in the data Object prop
  */
  @Input() threshold = null; // data value (y axis value) at which the line color will change to show a threshold in the data
  @Input() yAxisLabel = 'Value';
  @Input() xAxisLabel = 'Date';
  @Input() divHeight: any = '100%'; // for a % you need a container div with a non-% height and width;
  @Input() divWidth: any = '100%';
  @Input() axisFontSize: any = '14px';
  @Input() margins = { top: 20, right: 30, bottom: 60, left: 50 }; // margins object. These are the base values that will be used but you amy pass an Object with one or more keys to overwrite only the vaules you pass
  /* An example is you pass an Object like this 
      { top: 50 }
    This Object will be merged into the base margins Object passed above and will only change the top margin from 20 to 50
    Result will be { top: 50, right: 30, bottom: 60, left: 50 }
  */
  givenHeight = this.divHeight;
  givenWidth = this.divWidth;
  @Input() xAxisAngle = 45;
  resized = false;
  @ViewChildren('c', { read: ElementRef }) childComps: QueryList<ElementRef>;
  @ViewChild('vc', { read: ViewContainerRef, static: false }) viewContainer: ViewContainerRef;
  @ViewChild(TemplateRef, { static: false }) template: TemplateRef<null>;
  @Input() dateTimeFormat: string; //the format of the X axis data in a Moment string. Example is "MM-DD-YYYY"
  /* Now you do not need to preformat your data to be passed into the component
     The date or time value for the X axis can be in any format and must match the format here.
     It will then automatically be formatted to the correct D3 date or time format to be used in the Chart
   */
  @Input() axisLabelFormat: string; // This is the date or time format of the label that will be displayed on the X axis "MM/DD"
  /* Before the only values possible was shortened month name ("Nov") if it was a date or hour and minute ("9:45") depending on the data format
     Now you can customize it to any format just pass the Moment string for the format
     If no format is passed then it will fallback to previous baked in values as default ("Nov" or "9:45")
  */
  @Input() tooltipLabelFormat: string; //This is the date or time format of the data that will be  displayed in the tooltip
  /* Before the only values possible were Month Day Year ("November 15 2019") if date or Hour: Minute and am/pm ("9:45 am")
     Now you can customize it to any format just pass the Moment string for the format
     If no format is passed the it will fallback to the previous baked in values as default
  */
  @Input() displayTooltip = true;
  @Input() strockWidth = 2;

  timeDictionary: Object = {
    HH: '%H',
    H: '%H',
    hh: '%I',
    h: '%I',
    MM: '%m',
    mm: '%M',
    m: '%M',
    ss: '%S',
    s: '%S',
    a: '%p',
    A: '%p',
    DD: '%d',
    D: '%e',
    DDD: '%j',
    DDDD: '%j',
    MMMM: '%B',
    MMM: '%b',
    M: '%m',
    ddd: '%a',
    dddd: '%A',
    YY: '%y',
    YYYY: '%Y',
    Q: '%q',
    X: '%s',
    x: '%Q'
  };

  constructor(private decimalPipe: DecimalPipe) {
    window.addEventListener('resize', this.drawLinePlot.bind(this));
  }

  get area() {
    let height, width;
    if (typeof this.divHeight === 'number') {
      height = this.divHeight + 'px';
    } else {
      height = this.divHeight;
    }
    if (typeof this.divWidth === 'number') {
      width = this.divWidth + 'px';
    } else {
      width = this.divWidth;
    }
    return { height, width };
  }

  momentToD3(timeString: string) {
    let subStrings = timeString.match(/\w+|\s+|[^\s\w]+/g);
    subStrings = subStrings.map(str => {
      if (this.timeDictionary[str]) {
        str = this.timeDictionary[str];
      }
      return str;
    });
    return subStrings.join('');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.data.firstChange && !isEqual(changes.data.previousValue, changes.data.currentValue)) {
      this.drawLinePlot();
    }
  }

  ngAfterViewChecked() {
    const offsetHeight = document.querySelectorAll('#' + this.propID)[0]['offsetHeight'];
    const offsetWidth = document.querySelectorAll('#' + this.propID)[0]['offsetWidth'];
    if ((offsetHeight !== this.givenHeight || offsetWidth !== this.givenWidth) && this.resized === false) {
      this.givenHeight = offsetHeight;
      this.givenWidth = offsetWidth;
      this.drawLinePlot();
      this.resized = false;
    }
  }

  ngAfterViewInit() {
    if (!this.data || Array.isArray(this.data) || this.data === null) {
      console.error('Data must be an object');
    }
    if (!this.dateTimeFormat) {
      console.error('dateTimeFormat prop must be supplied. This is the date format of your data');
    }
    if (!this.lineColors && !this.thresholdColors) {
      console.error('Either lineColors prop or thresholdColors must be supplied.');
    }
    this.drawLinePlot();
  }

  drawLinePlot() {
    const localThis = this;
    const selection_string = '#' + this.propID;
    // grab data for a line to determine the datakey for x axis
    const dataSample = this.data[Object.keys(this.data)[0]];
    // get datakey for the x axis by finding keys of data point and filtering out value key
    const dataKey = Object.keys(dataSample[0]).filter(key => key !== 'value')[0];
    // remove previous chart and tooltips if already drawn on the page
    d3.selectAll(`.${this.propID}_tooltip`).remove();
    if (document.querySelectorAll(selection_string + ' svg')[0] != null) {
      document.querySelectorAll(selection_string + ' svg')[0].remove();
    }
    // make copy of the original data so we do not mutate it
    const data = {};
    for (let key in this.data) {
      const copy = this.data[key].map(dataPoint => {
        dataPoint = Object.assign({}, dataPoint);
        return dataPoint;
      });
      data[key] = copy;
    }

    // create parsers to format the data for display in graph
    const dateTimeParser = d3.timeParse(this.momentToD3(this.dateTimeFormat));

    //create date/time formatter to format text on tooltip
    let formatDate;
    if (this.tooltipLabelFormat && this.displayTooltip) {
      formatDate = d3.timeFormat(this.momentToD3(this.tooltipLabelFormat));
    } else {
      if (dataKey === 'date') {
        formatDate = d3.timeFormat('%B %-d %Y');
      } else if (dataKey === 'time') {
        formatDate = d3.timeFormat('%I:%M %p');
      }
    }

    // format dates and sort the data go through each key value pair for line and sorts the data array
    for (let key in data) {
      data[key].forEach(el => {
        el[dataKey] = dateTimeParser(el[dataKey]);
      });
      data[key] = data[key].sort(function (a, b) {
        return a[dataKey] - b[dataKey];
      });
    }

    let element: any;
    const selected = document.querySelectorAll(selection_string);

    if (selected[0] == null) {
      element = [{ clientWidth: 500, clientHeight: 500 }];
    } else {
      element = selected[0];
    }

    const margin = Object.assign({ top: 50, bottom: 50, right: 50, left: 50 }, this.margins);
    const width = element.clientWidth - margin.left - margin.right;
    let height = element.clientHeight - margin.top - margin.bottom - (this.xAxisAngle ? 10 : 0);
    if (height < 0) {
      height = 300;
    }

    // create functions that will be used to process x and y values from the data
    const xValue = function (d) {
      return d[dataKey];
    };
    const yValue = function (d) {
      return d.value;
    };
    // this flattens all the arrays into one so that we can find the lowest/highest values for axes and properly scale
    const allDataPoints = flatten(Object.values(data));
    // create the scales for the data and axes. range is the how big the axes will be and domain is what the
    // range of values will be for the axes.(this is calc by by finding min and max values of data points)
    const x = d3.scaleTime().range([0, width]).domain(d3.extent(allDataPoints, xValue)).nice();
    const y = d3.scaleLinear().range([height, 0]).domain(d3.extent(allDataPoints, yValue)).nice();

    // add tooltip to the DOM for the chart
    // const tooltip = d3.select('body').append('div').attr('class', `d3_visuals_tooltip ${this.propID}_tooltip`).style('opacity', 0);

    // format for x axis labels based on date or time, will be used to process raw data to readable dates/times
    // the format can be passed as a prop or is set by default whether the data type is data or time
    let timeFormatLabel;
    if (localThis.axisLabelFormat) {
      timeFormatLabel = d3.timeFormat(localThis.momentToD3(localThis.axisLabelFormat));
    } else {
      if (dataKey === 'date') {
        timeFormatLabel = d3.timeFormat('%b');
      } else if (dataKey === 'time') {
        timeFormatLabel = d3.timeFormat('%I:%M');
      }
    }

    // create axes and line for data to be appended later to the DOM
    const yAxis = d3.axisLeft().tickSizeInner(-width).scale(y),
      xAxis = d3.axisBottom().tickSizeInner(-height).tickFormat(timeFormatLabel).scale(x),
      line = d3
        .line()
        .curve(d3.curveLinear)
        .x(function (d) {
          return x(d[dataKey]);
        })
        .y(function (d) {
          return y(d.value);
        }),
      svg = d3
        .select(selection_string)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Is this for the line changing color at a specific threshold?? LP
    const gradID = this.propID + '-gradient',
      pathID = this.propID;

    if (localThis.threshold !== null) {
      svg
        .append('linearGradient')
        .attr('id', gradID)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', height)
        .selectAll('stop')
        .data([
          { offset: y(localThis.threshold) / height, color: this.thresholdColors[0] }, // Green
          { offset: y(localThis.threshold) / height, color: this.thresholdColors[1] } // Red
        ])
        .join('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);
    }

    svg
      .append('g')
      .attr('class', 'x axis x-axis xaxis')
      .style('fill', 'grey')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
      .append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('dy', '.71em')
      .style('fill', 'black')
      .style('text-anchor', 'middle')
      .attr('class', 'xaxis-tick')
      .attr('font-size', this.axisFontSize)
      .text(this.xAxisLabel)
      .attr('y', 40)
      .attr('class', 'label axislabel x-axis-label');

    const xAxisLabelHeight = svg.select('.label.x-axis-label').node().getBBox().height + 5;

    const xAxisText = svg.selectAll('g.x.axis g.tick text');
    xAxisText.attr('class', 'x-axis-text');

    if (this.xAxisAngle > 0 && this.xAxisAngle < 180) {
      xAxisText
        .attr('text-anchor', `${this.xAxisAngle <= 90 ? 'start' : 'end'}`)
        .attr('transform-origin', `left ${xAxisText.attr('dy')}`)
        .attr('transform', `rotate(${this.xAxisAngle <= 90 ? this.xAxisAngle : 90 - this.xAxisAngle})`);
    }

    xAxisText.each(function () {
      // truncate labels if the calculated size exceeds the allotted space
      var self = d3.select(this),
        textLength = self.node().getComputedTextLength(),
        fullText = self.text(),
        text = self.text();
      while (textLength > localThis.margins.bottom - xAxisLabelHeight && text.length > 0) {
        text = text.slice(0, -1);
        self.text(text + '...');
        textLength = self.node().getComputedTextLength();
      }
      self.append('svg:title').text(fullText);
    });

    svg
      .append('g')
      .attr('class', 'y axis y-axis')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left)
      .attr('dy', '.71em')
      .attr('class', 'label y-axis-label')
      .style('text-anchor', 'end')
      .style('fill', 'black')
      .attr('font-size', this.axisFontSize)
      .text(this.yAxisLabel);

    const yAxisLabelHeight = svg.select('.label.y-axis-label').node().getBBox().height + 5;

    const yAxisText = svg.selectAll('g.y.axis g.tick text');
    yAxisText.attr('class', 'y-axis-text');

    yAxisText.each(function () {
      // truncate labels if the calculated size exceeds the allotted space
      var self = d3.select(this),
        textLength = self.node().getComputedTextLength(),
        fullText = self.text(),
        text = self.text();
      while (textLength > localThis.margins.left - yAxisLabelHeight && text.length > 0) {
        text = text.slice(0, -1);
        self.text(text + '...');
        textLength = self.node().getComputedTextLength();
      }
      self.append('svg:title').text(fullText);
    });

    // create color map object to map labeled data with color supplied
    let colorMap = {};
    if (this.lineColors && Array.isArray(this.lineColors)) {
      Object.keys(data).forEach((key, ind) => {
        if (localThis.lineColors.length <= ind) {
          colorMap[key] = localThis.lineColors[localThis.lineColors.length % ind];
        } else {
          colorMap[key] = localThis.lineColors[ind];
        }
      });
    } else if (this.lineColors && typeof this.lineColors === 'object') {
      colorMap = this.lineColors;
    }

    if (localThis.threshold !== null) {
      for (let key in data) {
        svg
          .append('path')
          .datum(data[key])
          .attr('fill', 'none')
          .attr('stroke', `url("#${gradID}")`)
          .attr('stroke-width', localThis.strockWidth)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('d', line);
      }
    } else {
      for (let key in data) {
        svg
          .append('path')
          .datum(data[key])
          .attr('id', pathID + key)
          .attr('class', 'line linechartline')
          .attr('d', line)
          .attr('stroke', () => {
            return colorMap[key] || 'auto';
          })
          .attr('stroke-width', localThis.strockWidth);
      }
    }

    if (this.displayTooltip) {
      const xMap = function (d) {
        return x(xValue(d));
      };
      const yMap = function (d) {
        return y(yValue(d));
      };
      const clip_id = 'clip-' + this.propID;
      // add tooltip to the DOM for the chart
      const tooltip = d3.select('body').append('div').attr('class', `d3_visuals_tooltip ${this.propID}_tooltip`).style('opacity', 0);

      // add the dots at each data point and add events for mouseover/out to show/hide tooltips
      for (let key in data) {
        svg
          .selectAll('.dot')
          .data(data[key])
          .enter()
          .append('circle')
          .attr('class', `dot${key}`)
          .attr('r', 5)
          .attr('cx', xMap) // set the center of the dot using calculated x and y values
          .attr('cy', yMap)
          .attr('clip-path', 'url(#' + clip_id + ')')
          .attr('fill', 'black')
          .attr('opacity', 0)
          .on('mouseover', function (d) {
            tooltip.transition().duration(100).style('opacity', 1);
            tooltip
              .html(
                key +
                  '<br>' +
                  localThis.xAxisLabel +
                  ': ' +
                  formatDate(d[dataKey]) +
                  '<br>' +
                  localThis.yAxisLabel +
                  ': ' +
                  localThis.decimalPipe.transform(d.value)
              )
              .style('left', d3.event.pageX + 5 + 'px')
              .style('top', d3.event.pageY - 28 + 'px');
            d3.select(this).transition().duration(50).style('fill', 'black').attr('opacity', 1);
          })
          .on('mouseout', function (d) {
            tooltip.transition().duration(300).style('opacity', 0);
            d3.select(this).transition().duration(50).attr('opacity', 0);
          })
          .on('click', localThis.clickEvent.emit);
      }
    }
  }
}
