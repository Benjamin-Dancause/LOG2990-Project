/* eslint-disable @typescript-eslint/no-explicit-any */
import { AfterViewInit, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit, AfterViewInit {
    @Input() gameTitle: string;
    @Input() imageUrl: string;
    @Input() imageLink: string;
    @Input() difficulty: boolean;
    @Input() configuration: boolean;

    @ViewChild('namePopupTemplate', { static: true })
    namePopupTemplate: TemplateRef<any>;
    @ViewChild('namePopupTemplate1vs1', { static: true })
    namePopupTemplate1vs1: TemplateRef<any>;
    @ViewChild('notAvailableTemplate', { static: true })
    notAvailableTemplate: TemplateRef<any>;

    userName: string;
    name: string;
    createButton: boolean = true;

    bestSoloTimes = [
        { name: 'User 1', time: '00:30' },
        { name: 'User 2', time: '00:45' },
        { name: 'User 3', time: '00:20' },
        { name: 'User 4', time: '00:35' },
    ];

    best1vs1Times = [
        { name: 'User 5', time: '00:25' },
        { name: 'User 6', time: '00:40' },
        { name: 'User 7', time: '00:10' },
        { name: 'User 8', time: '00:30' },
    ];

    private readonly serverUrl: string = environment.serverUrl;

    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        private communication: CommunicationService,
        private socketService: SocketService,
        private gameCardService: GameCardService,
    ) {}

    get color() {
        return this.difficulty ? 'red' : 'green';
    }

    get levelText() {
        return this.difficulty ? 'Difficile' : 'Facile';
    }
    get topThreeBestTimesSolo() {
        return this.bestSoloTimes.slice(0, 3);
    }

    get topThreeBestTimesOneVsOne() {
        return this.best1vs1Times.slice(0, 3);
    }

    ngOnInit(): void {
        this.imageLink = this.serverUrl + `/assets/images/${this.gameTitle}_orig.bmp`;
        if (!this.configuration) {
            this.buttonUpdating();
        }
    }

    ngAfterViewInit(): void {
        if (!this.configuration) {
            this.buttonUpdating();
        }
    }

    openSettingsSolo(): void {
        sessionStorage.setItem('gameMode', 'solo');
        this.communication.getGameAvailability(this.gameTitle).subscribe((isAvailable) => {
            if (isAvailable) {
                this.dialog.open(this.namePopupTemplate, {
                    width: '400px',
                });
            } else {
                this.dialog.open(this.notAvailableTemplate, {
                    width: '400px',
                });
            }
        });
    }

    openSettings1vs1(): void {
        sessionStorage.setItem('gameMode', '1v1');
        this.communication.getGameAvailability(this.gameTitle).subscribe((isAvailable) => {
            if (isAvailable) {
                this.dialog.open(this.namePopupTemplate1vs1, {
                    width: '400px',
                });
            } else {
                this.dialog.open(this.notAvailableTemplate, {
                    width: '400px',
                });
            }
        });
    }
    saveUserName() {
        sessionStorage.setItem('userName', this.userName);
        sessionStorage.setItem('gameTitle', this.gameTitle);

        if (this.difficulty) {
            sessionStorage.setItem('difficulty', 'Difficile');
        }
        if (!this.difficulty) {
            sessionStorage.setItem('difficulty', 'Facile');
        }
    }

    buttonUpdating() {
        if (this.socketService && this.socketService.socket) {
            this.socketService.socket.on('awaiting-lobby', (gameTitle: string) => {
                if (gameTitle === this.gameTitle) {
                    this.createButton = false;
                }
            });
            this.socketService.socket.on('completed-lobby', (gameTitle: string) => {
                if (gameTitle === this.gameTitle) {
                    this.createButton = true;
                }
            });
        }
    }

    deleteGame(gameTitle: string) {
        this.gameCardService.getPlayers(this.gameTitle).subscribe((players) => {
            if (players.length === 0) {
                const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                    data: {
                        title: 'Confirmation',
                        message: 'Êtes-vous sûr de vouloir supprimer cette partie ?',
                    },
                });
                dialogRef.afterClosed().subscribe((result) => {
                    if (result === 'yes') {
                        this.communication.deleteGame(gameTitle).subscribe(() => {
                            this.reloadPage();
                        });
                    }
                });
            } else {
                alert('This card is currently being played by another user.');
            }
        });
    }

    reloadPage() {
        location.reload();
    }
}
