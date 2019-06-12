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
      "day_of_week": "0",
      "hour_volumes": [5, 3, 3, 4, 6, 5, 2, 4, 5, 7, 6, 7, 4, 3, 2, 5, 5, 11, 6, 10, 7, 7, 8, 5]
    },
    {
      "day_of_week": "1",
      "hour_volumes": [5, 6, 6, 7, 9, 5, 8, 2, 7, 7, 8, 2, 6, 5, 10, 7, 6, 11, 4, 5, 6, 3, 10, 5]
    },
    {
      "day_of_week": "2",
      "hour_volumes": [2, 11, 4, 6, 3, 9, 6, 6, 3, 7, 5, 3, 8, 7, 8, 3, 5, 11, 5, 8, 1, 9, 5, 8]
    },
    {
      "day_of_week": "3",
      "hour_volumes": [4, 10, 7, 4, 5, 9, 8, 3, 6, 5, 3, 7, 12, 6, 5, 9, 6, 8, 5, 7, 8, 3, 7, 10]
    },
    {
      "day_of_week": "4",
      "hour_volumes": [7, 7, 5, 5, 5, 7, 4, 4, 6, 10, 6, 8, 1, 9, 8, 8, 6, 4, 3, 4, 5, 11, 6, 9]
    },
    {
      "day_of_week": "5",
      "hour_volumes": [6, 7, 6, 6, 6, 6, 5, 6, 4, 10, 5, 8, 5, 6, 4, 1, 4, 11, 4, 5, 9, 2, 2, 6]
    },
    {
      "day_of_week": "6",
      "hour_volumes": [4, 2, 5, 10, 10, 6, 4, 5, 3, 7, 4, 7, 9, 8, 5, 7, 0, 6, 4, 2, 6, 10, 10, 4]
    }
  ]





}
