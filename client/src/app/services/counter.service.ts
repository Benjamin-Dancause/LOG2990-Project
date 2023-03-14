import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CounterService {
    private readonly baseUrl: string = environment.webSocketUrl;
    private counterSocket: Socket;
    counter: number = 0;

    initializeSocket(): void {
        // const uniqueId = Math.random().toString(36).substring(7);
        // this.counterSocket = io(this.baseUrl, { query: { id: uniqueId } });
        // console.log('This is the uniqueID for counter: ' + uniqueId);

        if (this.counterSocket) return;

        this.counterSocket = io(this.baseUrl);
        console.log('This is the uniqueID for counter: ' + this.counterSocket.id);
        this.counterSocket.on('counter-update', (counter: number) => {
            this.counter = counter;
            console.log('I entered the observable return');
        });
    }

    incrementCounter() {
        console.log('Incrementing counter called in service', this.counterSocket);
        this.counterSocket.emit('increment-counter');
    }

    resetCounter() {
        this.counterSocket.emit('reset-counter');
    }
}
