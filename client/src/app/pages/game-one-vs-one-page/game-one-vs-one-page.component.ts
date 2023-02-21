import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-game-one-vs-one-page',
    templateUrl: './game-one-vs-one-page.component.html',
    styleUrls: ['./game-one-vs-one-page.component.scss'],
})
export class GameOneVsOnePageComponent implements OnInit {
    showPopup = false;
    allDifferencesFound = false;

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
