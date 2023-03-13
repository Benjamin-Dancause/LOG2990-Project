import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CounterService {
    private readonly baseUrl: string = environment.webSocketUrl;
    private counterSocket: Socket;

    constructor() {}
    
    initializeSocket(): Observable<number> {
        const uniqueId = Math.random().toString(36).substring(7)
        this.counterSocket = io(this.baseUrl, { query: {id: uniqueId}});
        return new Observable<number>( observer => {
        this.counterSocket.on('counterUpdate', (counter: number) => {
            observer.next(counter);
        })
       });
    }

    incrementCounter() {
        this.counterSocket.emit('incrementCounter');
    }

    resetCounter() {
        this.counterSocket.emit('resetCounter');
    }
}
