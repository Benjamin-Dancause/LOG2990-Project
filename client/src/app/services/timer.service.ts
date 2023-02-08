import { Injectable } from '@angular/core';
import { interval, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  time = interval(1000).pipe(
    map(val => val + 1)
  );

  constructor() { }
}
