/* eslint-disable @typescript-eslint/no-explicit-any */
import { AfterViewInit, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';
import { bestTimes } from '@common/game-interfaces';
import { range } from 'rxjs';
import { delay } from 'rxjs/operators';
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
    @Input() bestTimes: bestTimes;

    @ViewChild('namePopupTemplate', { static: true })
    namePopupTemplate: TemplateRef<any>;
    @ViewChild('namePopupTemplate1vs1', { static: true })
    namePopupTemplate1vs1: TemplateRef<any>;
    @ViewChild('notAvailableTemplate', { static: true })
    notAvailableTemplate: TemplateRef<any>;

    userName: string;
    name: string;
    createButton: boolean = true;
    numbers : number[] = [];



    private readonly serverUrl: string = environment.serverUrl;

    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        private communication: CommunicationService,
        private socketService: SocketService,
        public gameCardService: GameCardService,
    ) {
        range(0, 3).subscribe(
              num => this.numbers.push(num),
            );
    }

    get color() {
        return this.difficulty ? 'red' : 'green';
    }

    get levelText() {
        return this.difficulty ? 'Difficile' : 'Facile';
    }

    get timesSolo() {
        return this.bestTimes.timesSolo;
    }



    ngOnInit(): void {
        this.imageLink = this.serverUrl + `/assets/images/${this.gameTitle}_orig.bmp`;
        if (!this.configuration) {
            this.buttonUpdating();
        }
    }

    convertTime(time: number): string {
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;
        let stringSeconds: string = seconds.toString();
        let stringMinutes: string  = minutes.toString();
        if (seconds < 10) {
            stringSeconds = '0' + seconds;
        }
        if (minutes < 10) {
            stringMinutes = '0' + minutes;
        }
        return stringMinutes + ':' + stringSeconds;
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
        if (sessionStorage.getItem('gameMode') === 'solo') {
            this.gameCardService.addPlayer(this.gameTitle, this.userName).subscribe();
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
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                data: {
                    title: 'Confirmation',
                    message: 'Êtes-vous sûr de vouloir supprimer cette partie ?',
                },
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result === 'yes') {
                    this.communication.deleteGame(gameTitle).subscribe(() => {
                        this.socketService.deleteGame(gameTitle);
                        this.reloadPage();
                    });
                }
            });
        });
    }

    resetBestTimes(gameTitle: string) {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: {
                title: 'Confirmation',
                message: 'Êtes-vous sûr de vouloir réinitialiser les meilleurs temps ?',
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'yes') {
                this.communication.resetBestTimes(gameTitle)
                delay(250);
                this.reloadPage();
            }
        });
    }

    reloadPage() {
        location.reload();
    }
}
