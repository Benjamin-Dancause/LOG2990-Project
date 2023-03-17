import { Injectable, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommunicationService } from './communication.service';
import { WaitingRoomService } from './waiting-room.service';

@Injectable({
    providedIn: 'root',
})
export class CounterService implements OnInit {
    counter: number = 0;
    counter2: number = 0;
    winCondition: number;
    gameMode: string;
    allDiffsSubscription: Subscription;

    constructor(public waitingRoomService: WaitingRoomService, private communicationService: CommunicationService) {}

    ngOnInit(): void {}

    initializeCounter(): void {
        const gameTitle: string = sessionStorage.getItem('gameTitle') as string;
        this.gameMode = sessionStorage.getItem('gameMode') as string;
        this.setWinCondition(this.gameMode, gameTitle);
        this.waitingRoomService.socket.on('counter-update', (counterInfo: { counter: number; player1: boolean }) => {
            const playerName: string = sessionStorage.getItem('userName') as string;
            const gameMaster: string = sessionStorage.getItem('gameMaster') as string;
            const isPlayer1: boolean = gameMaster === playerName;
            console.log('VALUE RECEIVED : ' + counterInfo.player1 + ' ================= VALUE isPlayer1 : ' + isPlayer1);
            if (!(this.gameMode === 'solo') && isPlayer1 !== counterInfo.player1) {
                this.counter2 = counterInfo.counter;
            } else {
                this.counter = counterInfo.counter;
            }

            if (this.counter === this.winCondition || this.counter2 === this.winCondition) {
                this.waitingRoomService.sendVictoriousPlayer(counterInfo.player1);
            }
        });
    }

    incrementCounter(player1: boolean) {
        this.waitingRoomService.socket.emit('increment-counter', player1);
    }

    resetCounter(player1: boolean) {
        this.waitingRoomService.socket.emit('reset-counter', player1);
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

    ngOnDestroy() {
        this.allDiffsSubscription.unsubscribe();
    }
}
