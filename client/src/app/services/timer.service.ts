import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WaitingRoomService } from './waiting-room.service';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    constructor(public waitingRoomService: WaitingRoomService) {}

    getTime(): Observable<number> {
        return new Observable<number>((observer) => {
            this.waitingRoomService.socket.on('timer', (time: number) => {
                observer.next(time);
            });
        });
    }

    resetTimer(roomId: string) {
        this.waitingRoomService.socket.emit('reset-timer', roomId);
    }
}
