import { Component } from '@angular/core';

@Component({
    selector: 'app-game-selection-page-component',
    templateUrl: './game-selection-page-component.component.html',
    styleUrls: ['./game-selection-page-component.component.scss'],
})
export class GameSelectionPageComponent {
    games = [
        { title: 'Game 1', image: 'https://i.stack.imgur.com/6umGW.png', level: 'easy', configuration: false },
        { title: 'Game 2', image: 'https://i.stack.imgur.com/6umGW.png', level: 'medium', configuration: true },
        { title: 'Game 3', image: 'https://i.stack.imgur.com/6umGW.png', level: 'hard', configuration: false },
        { title: 'Game 4', image: 'https://i.stack.imgur.com/6umGW.png', level: 'easy', configuration: false },
        { title: 'Game 5', image: 'https://i.stack.imgur.com/6umGW.png', level: 'medium', configuration: true },
        { title: 'Game 6', image: 'https://i.stack.imgur.com/6umGW.png', level: 'hard', configuration: false },
        { title: 'Game 7', image: 'https://i.stack.imgur.com/6umGW.png', level: 'medium', configuration: true },
        { title: 'Game 8', image: 'https://i.stack.imgur.com/6umGW.png', level: 'hard', configuration: false },
        { title: 'Game 9', image: 'https://i.stack.imgur.com/6umGW.png', level: 'hard', configuration: false },
        { title: 'Game 10', image: 'https://i.stack.imgur.com/6umGW.png', level: 'medium', configuration: true },
        { title: 'Game 11', image: 'https://i.stack.imgur.com/6umGW.png', level: 'hard', configuration: false },
    ];

    startIndex = 0;
    endIndex = 3;
    currentPage = 0;
    pageSize = 4;
    lastPage = Math.ceil(this.games.length / this.pageSize) - 1;

    get displayedGames() {
        return this.games.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);
    }

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
