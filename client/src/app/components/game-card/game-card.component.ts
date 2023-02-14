import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent {
    @Input() gameTitle: string;
    @Input() imageUrl: string;
    @Input() difficulty: boolean;
    @Input() configuration: boolean;

    @ViewChild('namePopupTemplate', { static: true })
    namePopupTemplate: TemplateRef<unknown>;
    userName: string;

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

    constructor(public dialog: MatDialog) {}

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

    openSettings(): void {
        this.dialog.open(this.namePopupTemplate, {
            width: '400px',
        });
    }

    saveUserName() {
        localStorage.setItem('userName', this.userName);
    }
}
