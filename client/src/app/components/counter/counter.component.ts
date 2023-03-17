import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CounterService } from '@app/services/counter.service';

@Component({
    selector: 'app-counter',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.scss'],
})
export class CounterComponent implements OnInit, OnDestroy {
    constructor(public counterService: CounterService) {
        this.player1 = this.isPlayer1();
    }

    count: number;
    player1: boolean;
    @Input() playerSide: boolean;

    ngOnInit(): void {
        console.log('ready before');
        this.counterService.resetCounter(this.player1);
        this.counterService.initializeCounter();
    }

    ngOnDestroy(): void {
        this.counterService.resetCounter(this.player1);
    }

    isPlayer1(): boolean {
        return sessionStorage.getItem('gameMaster') === sessionStorage.getItem('userName') ? true : false;
    }
}
