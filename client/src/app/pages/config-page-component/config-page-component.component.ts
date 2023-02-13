import { Component, OnInit } from '@angular/core';
import { Gamecard } from '@app/classes/gamecard';
import { CommunicationService } from '@app/services/communication.service';

const PAGE_SIZE = 4;

@Component({
    selector: 'app-config-page-component',
    templateUrl: './config-page-component.component.html',
    styleUrls: ['./config-page-component.component.scss'],
})
export class ConfigPageComponent implements OnInit {
    games: Gamecard[] = [];

    currentPage = 0;
    pageSize = PAGE_SIZE;
    lastPage = 0;

    constructor(protected communication: CommunicationService) {
        communication.getAvailableGames().subscribe((gamecards: Gamecard[]) => {
            for (const gamecard of gamecards) {
                gamecard.configuration = true;
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
