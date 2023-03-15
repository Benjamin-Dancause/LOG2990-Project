/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { CommunicationService } from '@app/services/communication.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {
    @Input() gameTitle: string;
    @Input() imageUrl: string;
    @Input() imageLink: string;
    @Input() difficulty: boolean;
    @Input() configuration: boolean;

    @ViewChild('namePopupTemplate', { static: true })
    namePopupTemplate: TemplateRef<any>;
    @ViewChild('notAvailableTemplate', { static: true })
    notAvailableTemplate: TemplateRef<any>;

    userName: string;
    name: string;

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

    constructor(public dialog: MatDialog, private communication: CommunicationService) {}

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
    }

    openSettings(): void {
        this.communication.getGameAvailability(this.gameTitle).subscribe((isAvailable) => {
            if (isAvailable) {
                this.dialog.open(this.namePopupTemplate, {
                    width: '400px',
                });
            } else {
                const dialogRef = this.dialog.open(this.notAvailableTemplate, {
                    width: '400px',
                });
                dialogRef.afterClosed().subscribe(() => {
                    this.reloadPage();
                });
            }
        });
    }

    saveGameName() {
        this.name = Math.random().toString(36).substring(7);
        localStorage.setItem('1v1username', this.name);
        console.log('Name is: ' + this.name);
        localStorage.setItem('gameTitle', this.gameTitle);
    }

    saveUserName() {
        localStorage.setItem('userName', this.userName);
        localStorage.setItem('gameTitle', this.gameTitle);
        if (this.difficulty) {
            localStorage.setItem('difficulty', 'Difficile');
        }
        if (!this.difficulty) {
            localStorage.setItem('difficulty', 'Facile');
        }
    }

    deleteGame(gameTitle: string) {
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
    }

    reloadPage() {
        location.reload();
    }
}
