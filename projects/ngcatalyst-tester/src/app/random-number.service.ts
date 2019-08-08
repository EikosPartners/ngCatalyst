import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RandomNumberService {


  constructor() { }

  randomNumber(min, max, int) {
    if (int) {
      return Math.floor(Math.random() * max) + min;
    } else {
      return (Math.random() * max) + min;
    }
  }

}
