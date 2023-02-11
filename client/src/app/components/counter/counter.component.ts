import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CounterService } from '@app/services/counter.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  providers: [CounterService]
})
export class CounterComponent implements OnInit, OnDestroy {
  
  counter: number = 0;
  @Output() counterEmitter = new EventEmitter<number>();
  private intervalSubscription: Subscription;

  constructor(private counterService: CounterService) { }

  ngOnInit(): void {
    this.intervalSubscription = interval(200).subscribe(() => {
      this.counterService.getCounter().subscribe((counter) => {
        this.counter = counter;
      });
    });
  }

  ngOnDestroy(): void {
    this.intervalSubscription.unsubscribe();
    this.counterService.resetCounter().subscribe();
  }
}
