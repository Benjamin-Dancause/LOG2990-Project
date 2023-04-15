import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { HistoryDialogComponent } from '@app/components/history-dialog/history-dialog.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SocketService } from '@app/services/socket/socket.service';
import { TIME } from '@common/constants';
import { GameSelectionPageData, bestTimes } from '@common/game-interfaces';
import { delay } from 'rxjs';

const PAGE_SIZE = 4;

@Component({
    selector: 'app-config-page-component',
    templateUrl: './config-page-component.component.html',
    styleUrls: ['./config-page-component.component.scss'],
})
export class ConfigPageComponent implements OnInit, OnDestroy {
    games: GameSelectionPageData[] = [];
    bestTimes: bestTimes[] = [];

    currentPage = 0;
    pageSize = PAGE_SIZE;
    lastPage = 0;

    constructor(protected communication: CommunicationService, public socketService: SocketService, public dialog: MatDialog) {
        communication.getAllGames().subscribe((gamecards: GameSelectionPageData[]) => {
            /* for (const gamecard of gamecards) {
                gamecard.configuration = true;
            }*/
            this.games = gamecards;
            this.lastPage = Math.ceil(this.games.length / this.pageSize) - 1;
        });
        communication.getAllBestTimes().subscribe((times: bestTimes[]) => {
            for (const game of this.games) {
                for (const bestTime of times) {
                    if (game.name === bestTime.name) {
                        this.bestTimes.push(bestTime);
                        break;
                    }
                }
            }
            /*
            for (let i = 0; i < this.games.length; i++) {
                for (let j = 0; j < bestTimes.length; j++) {
                    if (this.games[i].name === bestTimes[j].name) {
                        this.bestTimes.push(bestTimes[j]);
                        break;
                    }
                }
            }
            */
        });
    }

    get displayedGames() {
        return this.games.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);
    }

    ngOnInit(): void {
        this.lastPage = Math.ceil(this.games.length / this.pageSize) - 1;
        this.socketService.initializeSocket();
    }

    ngOnDestroy(): void {
        this.socketService.disconnectSocket();
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

    reloadPage() {
        location.reload();
    }
    resetBestTimes() {
        // console.log('reset');
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: {
                title: 'Confirmation',
                message: 'Êtes-vous sûr de vouloir réinitialiser les meilleurs temps ?',
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'yes') {
                this.communication.resetAllBestTimes();
                delay(TIME.BIG_DELAY);
                this.reloadPage();
            }
        });
    }

    AllGamesHistory() {
        this.communication.getGameAllHistory().subscribe((allGamesHistory) => {
            const dialogRef = this.dialog.open(HistoryDialogComponent, {
                data: {
                    title: 'Historique des parties',
                    history: allGamesHistory,
                    global: true
                }
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result === 'reset') {
                    this.communication.deleteGameHistory();
                }
            });
        });
    }
}
