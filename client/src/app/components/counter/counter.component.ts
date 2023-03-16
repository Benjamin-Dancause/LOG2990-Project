import { Component, OnDestroy, OnInit } from '@angular/core';
import { CounterService } from '@app/services/counter.service';

@Component({
    selector: 'app-counter',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.scss'],
})
export class CounterComponent implements OnInit, OnDestroy {
    constructor(public counterService: CounterService) {}

    count: number;

    ngOnInit(): void {
        console.log('ready before');
        this.counterService.initializeCounter();
    }

    ngOnDestroy(): void {
        this.counterService.resetCounter();
    }
}
