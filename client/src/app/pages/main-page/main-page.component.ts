import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    @ViewChild('gamemodeSelectionTemplate', { static: true })
    gamemodeSelectionTemplate: TemplateRef<any>;

    readonly title: string = 'Le Jeu Des Différences';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    userName: string;

    constructor(public dialog: MatDialog) {}

    gamemodeSelection(): void {
        this.dialog.open(this.gamemodeSelectionTemplate, {
            width: '410px',
        });
    }
    saveUserName(): void {
        sessionStorage.setItem('userName', this.userName);
    }
}
