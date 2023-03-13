import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    showPopup = false;
    allDifferencesFound = false;
    solo = true;

    findAllDifferences() {
        this.allDifferencesFound = true;
        this.showPopup = true;
    }

    returnToMainMenu() {
        this.showPopup = false;
    }

    ngOnInit() {
        // Game logic to detect if all differences have been found
        if (this.allDifferencesFound) {
            this.showPopup = true;
        }
    }
}
