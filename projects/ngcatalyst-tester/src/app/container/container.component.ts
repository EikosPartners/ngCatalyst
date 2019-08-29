import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit,
  Output, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';

import { RandomNumberService} from '../random-number.service';
const lineDataJson = require('../../assets/lineData.json');

@Component({
  selector: 'app-container',
  template: `
  <ng-container #vcl></ng-container>
  <ng-template>
  <div style="height: 500px; width: 900px">

      <eikos-line-plot  #cl
        [data]="lineData"
        [propID]="propID"
        [divWidth]="'90%'"

      >
      </eikos-line-plot>
      </div>
      </ng-template>

      // <span>       {{counter}}    </span>

  `,
  // templateUrl: './container.component.html',
  styleUrls: ['./container.component.css']
})

export class ContainerComponent implements OnInit, OnChanges {
  constructor(private randomNumberService: RandomNumberService) {
    window.onresize = this.onResize.bind(this);
   }

  @Input() data;
  lineData = lineDataJson;
  propID = "foobar";
  counter = 0;
  randomNumber = this.randomNumberService.randomNumber;
  @ViewChildren('cl', {read: ElementRef}) childComps: QueryList<ElementRef>;
  @ViewChild('vcl', {read: ViewContainerRef}) viewContainer: ViewContainerRef;
  @ViewChild(TemplateRef) template: TemplateRef<null>;

  // @HostListener('window:resize', ['$event']);

  onResize(event) {
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(this.template);
    this.counter += 1;
  }

   ngOnInit() {
    // this.lineData = this.lineData.map(item => item.date).map(item2 => {
    //   return {date: item2, value: this.randomNumber(-1000, 5000, true)};
    // });
    this.viewContainer.createEmbeddedView(this.template);
  }

  ngOnChanges(changes: SimpleChanges) {

  }
}
