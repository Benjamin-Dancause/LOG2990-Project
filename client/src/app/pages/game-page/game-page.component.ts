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
    allDifferencesFound = false;
    solo = true;

    constructor(private gameCardService: GameCardService, public waitingRoomService: WaitingRoomService) {}

    findAllDifferences() {
        this.allDifferencesFound = true;
        this.showPopup = true;
    }

    returnToMainMenu() {
        this.gameCardService.removePlayer(this.gameTitle, this.userName).subscribe();
        this.showPopup = false;
    }

    ngOnInit() {
        // Game logic to detect if all differences have been found
        this.waitingRoomService.soloGame();
        if (this.allDifferencesFound) {
            this.showPopup = true;
        }
    }
}
