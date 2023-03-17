import { Component, OnInit } from '@angular/core';
import { GameCardService } from '@app/services/game-card.service';
import { WaitingRoomService } from '@app/services/waiting-room.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    gameTitle: string;
    userName: string;
    
    showPopup = false;

    constructor(private gameCardService: GameCardService, public waitingRoomService: WaitingRoomService) {}


    returnToMainMenu() {
        this.gameCardService.removePlayer(this.gameTitle, this.userName).subscribe();
        this.showPopup = false;
    }

    ngOnInit() {
        this.gameTitle = sessionStorage.getItem('gameTitle') as string;
        this.waitingRoomService.soloGame();
    }

    ngAfterViewInit() {
        this.waitingRoomService.socket.on('send-victorious-player', (player1: boolean) => {
            this.showPopup = true;
        })
    }
   
   
}
