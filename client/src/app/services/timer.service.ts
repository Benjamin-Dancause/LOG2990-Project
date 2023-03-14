import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    private readonly baseUrl: string = environment.webSocketUrl;
    private socket: Socket;

    constructor() {}

    getTime(): Observable<number> {
        this.socket = io(this.baseUrl);
        return new Observable<number>((observer) => {
            this.socket.on('timer', (time: number) => {
                observer.next(time);
            });
        });
    }

    resetTimer() {
        this.socket.emit('reset-timer');
    }
}
