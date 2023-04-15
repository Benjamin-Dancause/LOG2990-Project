import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// eslint-disable-next-line no-restricted-imports
import { ReplayService } from '../replay/replay.service';
import { SocketService } from '../socket/socket.service';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    constructor(public socketService: SocketService, public replay: ReplayService) {}

    getTime(): Observable<number> {
        return new Observable<number>((observer) => {
            this.socketService.socket.on('timer', (time: number) => {
                observer.next(time);
                if ((sessionStorage.getItem('gameMode') as string) === 'tl' && time === 0) {
                    this.socketService.sendVictoriousPlayer(true);
                }
            });
        });
    }

    resetTimer(roomId: string) {
        this.socketService.resetTimer(roomId);
    }
}
