import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngcatalyst-tester';
  data =[
    {"label":"Cambridge","value":55},
    {"label":"Gloves","value":48},
    {"label":"Auto","value":45},
    {"label":"Planner","value":50},
    {"label":"Granite","value":55},
    {"label":"Canterbury","value":54},
    {"label":"Architect","value":48},
    {"label":"Markets","value":46},
    {"label":"Cotton","value":52},
    {"label":"Agent","value":47}
  ]
  donutWidth: 250;




}
