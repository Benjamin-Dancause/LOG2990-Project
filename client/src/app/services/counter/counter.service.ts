/* eslint-disable no-restricted-imports */
import { EventEmitter, Injectable } from '@angular/core';
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
    allDiffsSubscription: Subscription = new Subscription();
    allTimesForGameSubscription: Subscription = new Subscription();
    victorySent: boolean = false;
    recordMessage = new EventEmitter<string>();

    constructor(public socketService: SocketService, public communicationService: CommunicationService) {}

    initializeCounter(): void {
        const gameTitle: string = sessionStorage.getItem('gameTitle') as string;
        this.gameMode = sessionStorage.getItem('gameMode') as string;
        this.setStartingDate();
        this.setWinCondition(this.gameMode, gameTitle);
        this.socketService.socket.on('counter-update', (counterInfo: { counter: number; player1: boolean }) => {
            const playerName: string = sessionStorage.getItem('userName') as string;
            const gameMaster: string = sessionStorage.getItem('gameMaster') as string;
            const isPlayer1: boolean = gameMaster === playerName;
            if (!(this.gameMode === 'solo') && !(this.gameMode === 'tl') && isPlayer1 !== counterInfo.player1) {
                this.counter2 = counterInfo.counter;
            } else {
                this.counter = counterInfo.counter;
            }

            if (this.counter === this.winCondition && !this.victorySent) {
                this.isNewBestTime(gameTitle);
                this.socketService.sendVictoriousPlayer(counterInfo.player1);
                this.victorySent = true;
            }
        });
    }

    incrementCounter(player1: boolean) {
        this.socketService.incrementCounter(player1);
    }

    resetCounter(player1: boolean) {
        this.victorySent = false;
        this.counter = 0;
        this.counter2 = 0;
        this.winCondition = 1000;
        this.socketService.resetCounter(player1);
    }

    setStartingDate() {
        const currentTime = new Date().toLocaleString();
        sessionStorage.setItem('startingDate', currentTime);
    }

    setWinCondition(gameMode: string, gameTitle: string) {
        this.allDiffsSubscription = this.communicationService.getDiffAmount(gameTitle).subscribe((totalDiff: number) => {
            if (gameMode === '1v1') {
                this.winCondition = Math.ceil(totalDiff / 2);
            } else if (gameMode === 'solo') {
                this.winCondition = totalDiff;
            } else {
                this.winCondition = 1000;
            }
        });
    }

    isNewBestTime(gameTitle: string) {
        this.socketService.socket.off('new-record-time');
        this.socketService.socket.on('new-record-time', (newTime) => {
            this.allTimesForGameSubscription = this.communicationService.getBestTimesForGame(gameTitle, this.gameMode).subscribe((bestTimes) => {
                if (newTime < bestTimes[0]) {
                    this.recordMessage.emit('1ère');
                } else if (newTime < bestTimes[1]) {
                    this.recordMessage.emit('2e');
                } else if (newTime < bestTimes[2]) {
                    this.recordMessage.emit('3e');
                }
            });
        });
    }

    unsubscribeFrom() {
        if (this.allDiffsSubscription) {
            this.allDiffsSubscription.unsubscribe();
        }
        if (this.allTimesForGameSubscription) {
            this.allTimesForGameSubscription.unsubscribe();
        }
    }
}
