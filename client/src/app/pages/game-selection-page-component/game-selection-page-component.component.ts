import { Component, OnInit } from '@angular/core';
import { GameSelectionPageData } from '@app/components/create-image/create-image.component';
import { CommunicationService } from '@app/services/communication.service';

const PAGE_SIZE = 4;

@Component({
    selector: 'app-game-selection-page-component',
    templateUrl: './game-selection-page-component.component.html',
    styleUrls: ['./game-selection-page-component.component.scss'],
})
export class GameSelectionPageComponent implements OnInit {
    games: GameSelectionPageData[] = [];

    currentPage = 0;
    pageSize = PAGE_SIZE;
    lastPage = 0;

    constructor(protected communication: CommunicationService) {
        communication.getAllGames().subscribe((gamecards: GameSelectionPageData[]) => {
            for (const gamecard of gamecards) {
                console.log(gamecard.image);
                console.log(gamecard.name);
                console.log(gamecard.difficulty);
            }
            this.games = gamecards;
            this.lastPage = Math.ceil(this.games.length / this.pageSize) - 1;
        });
    }

    get displayedGames() {
        return this.games.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);
    }

    ngOnInit(): void {
        this.lastPage = Math.ceil(this.games.length / this.pageSize) - 1;

        for (const game of this.games) {
            console.log('test' + game.image);
        }
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
