import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CounterService {
  private counterSubject = new Subject<number>();
  
  constructor(private http: HttpClient){}

  incrementCounter() {
    this.http.post('', {}).subscribe((counter: number) => {
      this.counterSubject.next(counter);
    })
  }
  
  getCounterObservable() {
    return this.counterSubject.asObservable();
  }
}
