import { Component, OnDestroy, OnInit } from '@angular/core';
import { CounterService } from '@app/services/counter.service';

@Component({
    selector: 'app-counter',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.scss'],
    providers: [CounterService],
})
export class CounterComponent implements OnInit, OnDestroy {
    counter: number = 0;
    
    
    constructor(private counterService: CounterService) {}

    ngOnInit(): void {
        this.counterService.initializeSocket().subscribe((counter) => {
            this.counter = counter;
        });
    }

    ngOnDestroy(): void {
        this.counterService.resetCounter();
    }
}
