import { Component, Input, OnInit } from '@angular/core';
import { CounterService } from '@app/services/counter/counter.service';

@Component({
    selector: 'app-counter',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.scss'],
})
export class CounterComponent implements OnInit {
    @Input() playerSide: boolean;

    count: number;
    player1: boolean;
    constructor(public counterService: CounterService) {}

    ngOnInit(): void {
        this.player1 = this.isPlayer1();
        this.counterService.resetCounter(this.player1);
        this.counterService.initializeCounter();
    }

    isPlayer1(): boolean {
        return sessionStorage.getItem('gameMaster') === sessionStorage.getItem('userName') ? true : false;
    }
}
