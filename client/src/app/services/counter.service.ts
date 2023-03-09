import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CounterService {
    private readonly baseUrl: string = environment.webSocketUrl;
    private socket: Socket;
    private _counter: number = 0;

    constructor() {}
    
    initializeSocket(): Observable<number> {
        const uniqueId = Math.random().toString(36).substring(7)
        this.socket = io(this.baseUrl, { query: {clientId: uniqueId, counter: this._counter}});
        return new Observable<number>( observer => {
        this.socket.on('counterUpdate', (counter: number) => {
            this._counter = counter;
            observer.next(counter);
        })
       });
    }

    incrementCounter() {
        this.socket.emit('incrementCounter');
    }

    resetCounter() {
        this.socket.emit('resetCounter');
    }
}
