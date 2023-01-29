import { Component } from '@angular/core';

@Component({
    selector: 'app-game-selection-page-component',
    templateUrl: './game-selection-page-component.component.html',
    styleUrls: ['./game-selection-page-component.component.scss'],
})
export class GameSelectionPageComponent {
    games = [
        { title: 'Game 1', image: 'game1.jpg', level: 'easy', configuration: false },
        { title: 'Game 2', image: 'game2.jpg', level: 'medium', configuration: true },
        { title: 'Game 3', image: 'game3.jpg', level: 'hard', configuration: false },
        { title: 'Game 4', image: 'game1.jpg', level: 'easy', configuration: false },
        { title: 'Game 5', image: 'game2.jpg', level: 'medium', configuration: true },
        { title: 'Game 6', image: 'game3.jpg', level: 'hard', configuration: false },
        { title: 'Game 7', image: 'game2.jpg', level: 'medium', configuration: true },
        { title: 'Game 8', image: 'game3.jpg', level: 'hard', configuration: false },
    ];

    startIndex = 0;
    endIndex = 3;
    displayedGames = this.games.slice(this.startIndex, this.endIndex + 1);

    gameTitle1 = 'Angry Birds';
    gameTitle2 = 'DbD';
    gameTitle3 = 'Pokemon';
    gameTitle4 = 'Fortnite';
    gameImage1 = 'https://upload.wikimedia.org/wikipedia/en/4/4e/Angry_Birds_logo.svg';

    currentPage = 0;
    pageSize = 4;
    lastPage = Math.ceil(this.games.length / this.pageSize) - 1;

    onBack() {
        if (this.currentPage > 0) {
            this.currentPage--;
        }
    }

    onNext() {
        if (this.currentPage < this.lastPage) {
            this.currentPage++;
        }
    }
}

/* import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-game-selection-page-component',
    templateUrl: './game-selection-page-component.component.html',
    styleUrls: ['./game-selection-page-component.component.scss'],
})
export class GameSelectionPageComponentComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}
}
*/
