import { Component, OnInit } from '@angular/core';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    gameTitle: string;
    userName: string;

    showPopup = false;

    constructor(private gameCardService: GameCardService, public socketService: SocketService) {}

    returnToMainMenu() {
        this.gameCardService.removePlayer(this.gameTitle, this.userName).subscribe();
        this.showPopup = false;
    }

    ngOnInit() {
        this.gameTitle = sessionStorage.getItem('gameTitle') as string;
        this.socketService.soloGame();
    }

    ngAfterViewInit() {
        this.socketService.socket.on('send-victorious-player', (player1: boolean) => {
            this.showPopup = true;
        });
    }
}
