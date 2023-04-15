import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// eslint-disable-next-line no-restricted-imports
// eslint-disable-next-line import/no-unresolved
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-give-up-button',
    templateUrl: './give-up-button.component.html',
    styleUrls: ['./give-up-button.component.scss'],
})
export class GiveUpButtonComponent implements OnInit {
    @Input() text: string;
    @Input() color: string;
    @ViewChild('giveUpPromptTemplate', { static: true }) giveUpPromptTemplate: TemplateRef<unknown>;
    gameTitle: string;
    userName: string;

    constructor(public dialog: MatDialog, public gameCardService: GameCardService, public socketService: SocketService) {}

    giveUpConfirmPrompt(): void {
        this.dialog.open(this.giveUpPromptTemplate, {
            width: '500px',
            height: '250px',
        });
    }

    removeUser(): void {
        const gameMode: string = sessionStorage.getItem('gameMode') as string;
        // console.log('TL ?: ' + gameMode);
        // console.log(gameMode === 'tl');
        if (gameMode === 'tl') {
            // console.log('enters line 34');
            this.socketService.leaveLimitedTime();
        } else {
            // console.log('Enters line 36');
            this.socketService.leaveGame();
        }
        this.gameCardService.removePlayer(this.gameTitle, this.userName).subscribe();
    }

    ngOnInit() {
        // Game logic to detect if all differences have been found
        this.gameTitle = sessionStorage.getItem('gameTitle') as string;
        this.userName = sessionStorage.getItem('userName') as string;
    }
}
