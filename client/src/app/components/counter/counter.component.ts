import { Component, OnDestroy, OnInit } from '@angular/core';
import { CounterService } from '@app/services/counter.service';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-counter',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.scss'],
    providers: [CounterService],
})
export class CounterComponent implements OnInit, OnDestroy {
    counter: number = 0;
    private intervalSubscription: Subscription;

    constructor(private counterService: CounterService) {}

    ngOnInit(): void {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
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
