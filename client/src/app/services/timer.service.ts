import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SocketService } from './socket.service';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    constructor(public socketService: SocketService) {}

    getTime(): Observable<number> {
        return new Observable<number>((observer) => {
            this.socketService.socket.on('timer', (time: number) => {
                observer.next(time);
            });
        });
    }

    resetTimer(roomId: string) {
        this.socketService.socket.emit('reset-timer', roomId);
    }
}
