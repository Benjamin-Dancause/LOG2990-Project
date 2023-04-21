import { Injectable } from '@angular/core';
import { ReplayService } from '@app/services/replay/replay.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Observable } from 'rxjs';

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
