import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
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

    constructor(public dialog: MatDialog, public socketService: SocketService) {}

    gamemodeSelection(): void {
        this.dialog.open(this.gamemodeSelectionTemplate, {
            width: '410px',
        });
    }
    saveUserName(): void {
        sessionStorage.setItem('userName', this.userName);
        sessionStorage.setItem('gameMode', 'tl');
        sessionStorage.setItem('gameTitle', 'Monkey');
        this.socketService.initializeSocket();
    }
}
