import { AfterViewInit, Component } from '@angular/core';
import { CounterService } from '@app/services/counter.service';
import { GameCardService } from '@app/services/game-card.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-game-one-vs-one-page',
    templateUrl: './game-one-vs-one-page.component.html',
    styleUrls: ['./game-one-vs-one-page.component.scss'],
})
export class GameOneVsOnePageComponent implements AfterViewInit {
    gameTitle: string;
    userName: string;
    winningPlayer: string = '';
    player1: boolean = false;
    isWinner: boolean = false;
    showPopup = false;

    constructor(private gameCardService: GameCardService, public socketService: SocketService, private counterService: CounterService) {}

    returnToMainMenu() {
        this.gameCardService.removePlayer(this.gameTitle, this.userName).subscribe();
        this.showPopup = false;
    }

    ngOnInit() {
        this.gameTitle = sessionStorage.getItem('gameTitle') as string;
        this.player1 = this.isPlayer1();
    }

    ngAfterViewInit() {
        this.socketService.socket.on('send-victorious-player', (player1: boolean) => {
            if (this.counterService.counter > this.counterService.counter2) {
                this.isWinner = true;
                this.winningPlayer = sessionStorage.getItem('userName') as string;
                this.showPopup = true;
            } else {
                this.isWinner = false;
                if ((sessionStorage.getItem('userName') as string) === (sessionStorage.getItem('gameMaster') as string)) {
                    this.winningPlayer = sessionStorage.getItem('joiningPlayer') as string;
                } else {
                    this.winningPlayer = sessionStorage.getItem('gameMaster') as string;
                }
                this.showPopup = true;
            }
        });

        this.socketService.socket.on('player-quit-game', () => {
            this.isWinner = true;
            this.winningPlayer = sessionStorage.getItem('userName') as string;
            this.showPopup = true;
        });
    }

    isPlayer1(): boolean {
        return sessionStorage.getItem('gameMaster') === sessionStorage.getItem('userName') ? true : false;
    }

    isWinningPlayer() {}
}
