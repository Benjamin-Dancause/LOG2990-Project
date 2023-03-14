import { Injectable } from '@angular/core';
import { WaitingRoomService } from './waiting-room.service';

@Injectable({
    providedIn: 'root',
})
export class CounterService {
    counter: number = 0;

    constructor(public waitingRoomService: WaitingRoomService) {}

    initializeCounter(): void {
        // const uniqueId = Math.random().toString(36).substring(7);
        // this.counterSocket = io(this.baseUrl, { query: { id: uniqueId } });
        // console.log('This is the uniqueID for counter: ' + uniqueId);
        this.waitingRoomService.socket.on('counter-update', (counter: number) => {
            this.counter = counter;
            console.log('I entered the observable return');
        });
    }

    incrementCounter() {
        this.waitingRoomService.socket.emit('increment-counter');
    }

    resetCounter() {
        this.waitingRoomService.socket.emit('reset-counter');
    }
}
