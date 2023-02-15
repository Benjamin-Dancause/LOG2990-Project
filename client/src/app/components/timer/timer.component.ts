/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TimerService } from '@app/services/timer.service';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit, OnDestroy {
    min = 0;
    sec = 0;
    minutes = '00';
    seconds = '00';
    private intervalSubscription: Subscription;

    constructor(private timerService: TimerService) {}

    ngOnInit(): void {
        this.intervalSubscription = interval(1000).subscribe(() => {
            this.timerService.getTime().subscribe((time) => {
                this.min = Math.floor(time / 60);
                this.sec = time % 60;
                this.minutes = this.pad(this.min);
                this.seconds = this.pad(this.sec);
            });
        });
    }

    ngOnDestroy(): void {
        this.intervalSubscription.unsubscribe();
        this.timerService.resetTimer().subscribe();
    }

    pad(value: number) {
        return value.toString().padStart(2, '0');
    }
}
