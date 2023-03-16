import { Injectable } from '@angular/core';
import { WaitingRoomService } from './waiting-room.service';

@Injectable({
    providedIn: 'root',
})
export class CounterService {
    counter: number = 0;

    constructor(public waitingRoomService: WaitingRoomService) {}

    initializeCounter(): void {
        this.waitingRoomService.socket.on('counter-update', (counter: number) => {
            this.counter = counter;
            console.log('I entered the observable return');
        });
    }

    incrementCounter(player1: boolean) {
        this.waitingRoomService.socket.emit('increment-counter', player1);
    }

    resetCounter() {
        this.waitingRoomService.socket.emit('reset-counter');
    }
}
