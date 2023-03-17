import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommunicationService } from './communication.service';
import { WaitingRoomService } from './waiting-room.service';

@Injectable({
    providedIn: 'root',
})
export class CounterService {
    counter: number = 0;
    counter2: number = 0;
    winCondition: number;
    allDiffsSubscription: Subscription;

    constructor(public waitingRoomService: WaitingRoomService, private communicationService: CommunicationService) {}

    initializeCounter(): void {
        this.waitingRoomService.socket.on('counter-update', (counterInfo: { counter: number; player1: boolean }) => {
            const playerName: string = sessionStorage.getItem('userName') as string;
            const gameMaster: string = sessionStorage.getItem('gameMaster') as string;
            const gameMode: string = sessionStorage.getItem('gameMode') as string;
            const gameTitle: string = sessionStorage.getItem('gameTitle') as string;
            const isPlayer1: boolean = gameMaster === playerName;
            this.setWinCondition(gameMode, gameTitle);
            console.log('LINE 17 IN COUNTER SERVICE: ' + isPlayer1);
            if (!(gameMode === 'solo') && isPlayer1 !== counterInfo.player1) {
                this.counter2 = counterInfo.counter;
                if(this.counter2 === this.winCondition) {
                    this.waitingRoomService.sendVictoriousPlayer(isPlayer1);
                }
                console.log('Your opponent found a difference !');
                console.log('Opponent count is: ' + this.counter2);
            } else {
                this.counter = counterInfo.counter;
                if(this.counter === this.winCondition) {
                    this.waitingRoomService.sendVictoriousPlayer(isPlayer1);
                }

                console.log('You have Found a difference !');
                console.log('Your count is: ' + this.counter);
            }
            console.log('I entered the observable return');
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
            if(gameMode !== 'solo') {
                this.winCondition = totalDiff / 2;
            }
            else {
                this.winCondition = totalDiff;
            }
        });
    }

    ngOnDestroy() {
        this.allDiffsSubscription.unsubscribe();
    }

}
