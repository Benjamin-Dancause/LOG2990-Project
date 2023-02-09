import { Component } from '@angular/core';

const PAGE_SIZE = 4;

@Component({
    selector: 'app-config-page-component',
    templateUrl: './config-page-component.component.html',
    styleUrls: ['./config-page-component.component.scss'],
})
export class ConfigPageComponent {
    games = [
        { title: 'Game 1', image: 'https://i.stack.imgur.com/6umGW.png', level: 'easy', configuration: true },
        { title: 'Game 2', image: 'https://i.stack.imgur.com/6umGW.png', level: 'hard', configuration: true },
        { title: 'Game 3', image: 'https://i.stack.imgur.com/6umGW.png', level: 'hard', configuration: true },
        { title: 'Game 4', image: 'https://i.stack.imgur.com/6umGW.png', level: 'easy', configuration: true },
        { title: 'Game 5', image: 'https://i.stack.imgur.com/6umGW.png', level: 'easy', configuration: true },
        { title: 'Game 6', image: 'https://i.stack.imgur.com/6umGW.png', level: 'easy', configuration: true },
        { title: 'Game 7', image: 'https://i.stack.imgur.com/6umGW.png', level: 'hard', configuration: true },
        { title: 'Game 8', image: 'https://i.stack.imgur.com/6umGW.png', level: 'hard', configuration: true },
        { title: 'Game 9', image: 'https://i.stack.imgur.com/6umGW.png', level: 'hard', configuration: true },
        { title: 'Game 10', image: 'https://i.stack.imgur.com/6umGW.png', level: 'easy', configuration: true },
        { title: 'Game 11', image: 'https://i.stack.imgur.com/6umGW.png', level: 'hard', configuration: true },
    ];

    startIndex = 0;
    endIndex = 3;
    currentPage = 0;
    pageSize = PAGE_SIZE;

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
