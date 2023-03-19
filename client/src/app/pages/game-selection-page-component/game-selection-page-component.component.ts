/* eslint-disable no-console */
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { WaitingRoomService } from '@app/services/waiting-room.service';
import { GameSelectionPageData } from '@common/game-interfaces';

const PAGE_SIZE = 4;

@Component({
    selector: 'app-game-selection-page-component',
    templateUrl: './game-selection-page-component.component.html',
    styleUrls: ['./game-selection-page-component.component.scss'],
})
export class GameSelectionPageComponent implements OnInit, AfterViewInit {
    games: GameSelectionPageData[] = [];

    currentPage = 0;
    pageSize = PAGE_SIZE;
    lastPage = 0;

    constructor(protected communication: CommunicationService, public waitingRoomService: WaitingRoomService) {
        communication.getAllGames().subscribe((gamecards: GameSelectionPageData[]) => {
            this.games = gamecards;
            this.lastPage = Math.ceil(this.games.length / this.pageSize) - 1;
        });
    }

    get displayedGames() {
        return this.games.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);
    }

    ngOnInit(): void {
        this.waitingRoomService.initializeSocket();
        this.lastPage = Math.ceil(this.games.length / this.pageSize) - 1;
    }

    ngAfterViewInit(): void {}

    disconnectSocket() {
        this.waitingRoomService.disconnectSocket();
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
