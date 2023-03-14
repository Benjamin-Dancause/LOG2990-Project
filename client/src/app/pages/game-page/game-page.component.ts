import { Component, OnInit } from '@angular/core';
import { WaitingRoomService } from '@app/services/waiting-room.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    showPopup = false;
    allDifferencesFound = false;

    constructor(public waitingRoomService: WaitingRoomService) {}
    findAllDifferences() {
        this.allDifferencesFound = true;
        this.showPopup = true;
    }

    returnToMainMenu() {
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
