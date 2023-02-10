import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CounterService } from '@app/services/counter.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  providers: [CounterService]
})

export class TopBarComponent implements OnInit, OnDestroy{

  @Input() name: string;
  @Input() userName: string;
  @Input() counter: number = 0;
  counterSubcription: Subscription;

  constructor(private counterService: CounterService) {}
  

  ngOnInit() {
    this.counterSubcription =  this.counterService.getCounterObservable().subscribe((counter: number) => {
      this.counter = counter;
    });
  }
  

  ngOnDestroy(){
    this.counterSubcription.unsubscribe();
  }


}
