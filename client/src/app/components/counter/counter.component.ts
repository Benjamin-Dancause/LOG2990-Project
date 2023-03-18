import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CounterService } from '@app/services/counter.service';

@Component({
    selector: 'app-counter',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.scss'],
})
export class CounterComponent implements OnInit, AfterViewInit, OnDestroy {
    constructor(public counterService: CounterService) {}

    count: number;
    player1: boolean;
    @Input() playerSide: boolean;

    ngOnInit(): void {
        this.player1 = this.isPlayer1();
        this.counterService.resetCounter(this.player1);
        this.counterService.initializeCounter();
    }

    ngAfterViewInit(): void {}

    ngOnDestroy(): void {}

    isPlayer1(): boolean {
        return sessionStorage.getItem('gameMaster') === sessionStorage.getItem('userName') ? true : false;
    }
}
