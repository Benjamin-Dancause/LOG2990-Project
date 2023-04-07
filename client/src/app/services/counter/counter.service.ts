/* eslint-disable no-restricted-imports */
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommunicationService } from '../communication/communication.service';
import { SocketService } from '../socket/socket.service';

@Injectable({
    providedIn: 'root',
})
export class CounterService {
    counter: number = 0;
    counter2: number = 0;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    winCondition: number = 1000;
    gameMode: string;
    allDiffsSubscription: Subscription;

    constructor(public socketService: SocketService, private communicationService: CommunicationService) {}

    initializeCounter(): void {
        const gameTitle: string = sessionStorage.getItem('gameTitle') as string;
        this.gameMode = sessionStorage.getItem('gameMode') as string;
        this.setWinCondition(this.gameMode, gameTitle);
        this.socketService.socket.on('counter-update', (counterInfo: { counter: number; player1: boolean }) => {
            const playerName: string = sessionStorage.getItem('userName') as string;
            const gameMaster: string = sessionStorage.getItem('gameMaster') as string;
            const isPlayer1: boolean = gameMaster === playerName;
            if (!(this.gameMode === 'solo') && isPlayer1 !== counterInfo.player1) {
                this.counter2 = counterInfo.counter;
            } else {

                this.counter = counterInfo.counter;
            }

            if (this.counter === this.winCondition) {
                this.socketService.sendVictoriousPlayer(counterInfo.player1);
            }
        });
    }

    incrementCounter(player1: boolean) {
        this.socketService.incrementCounter(player1);
    }

    resetCounter(player1: boolean) {
        this.counter = 0;
        this.counter2 = 0;
        this.socketService.resetCounter(player1);
    }

    setWinCondition(gameMode: string, gameTitle: string) {
        this.allDiffsSubscription = this.communicationService.getDiffAmount(gameTitle).subscribe((totalDiff: number) => {
            if (gameMode !== 'solo') {
                this.winCondition = Math.ceil(totalDiff / 2);
            } else {
                this.winCondition = totalDiff;
            }
        });
    }

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnDestroy() {
        if (this.allDiffsSubscription) {
            this.allDiffsSubscription.unsubscribe();
        }
    }
}
