import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RandomNumberService} from '../random-number.service';
const lineDataJson = require('../../assets/lineData.json');

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css']
})
export class ContainerComponent implements OnInit, OnChanges {

  @Input() data;
  lineData = lineDataJson;
  propID = "foobar";

  constructor(private randomNumberService: RandomNumberService) { }

  randomNumber = this.randomNumberService.randomNumber;

  ngOnInit() {
    this.lineData = this.lineData.map(item => item.date).map(item2 => {
      return {date: item2, value: this.randomNumber(-1000, 1000, true)};
    });

  }

  ngOnChanges(changes: SimpleChanges) {

  }
}
