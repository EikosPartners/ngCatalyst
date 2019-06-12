import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngcatalyst-tester';
  data =[
    {
      "date": "2017-06-01",
      "value": 120
    },
    {
      "date": "2017-09-01",
      "value": -21
    },
    {
      "date": "2017-04-01",
      "value": 193
    },
    {
      "date": "2017-02-01",
      "value": 313
    },
    {
      "date": "2017-01-01",
      "value": 340
    },
    {
      "date": "2017-07-01",
      "value": 200
    },
    {
      "date": "2017-08-01",
      "value": -100
    }
  ]



}
