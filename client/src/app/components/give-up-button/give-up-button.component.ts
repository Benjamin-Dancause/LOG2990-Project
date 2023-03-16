import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameCardService } from '@app/services/game-card.service';

@Component({
    selector: 'app-give-up-button',
    templateUrl: './give-up-button.component.html',
    styleUrls: ['./give-up-button.component.scss'],
})
export class GiveUpButtonComponent implements OnInit {
    @Input() text: string;
    @Input() color: string;
    @ViewChild('giveUpPromptTemplate', { static: true })
    giveUpPromptTemplate: TemplateRef<unknown>;
    gameTitle: string;
    userName: string;

    constructor(public dialog: MatDialog, private gameCardService: GameCardService) {}

    giveUpConfirmPrompt(): void {
        this.dialog.open(this.giveUpPromptTemplate, {
            width: '500px',
            height: '250px',
        });
    }

    removeUser(): void {
        this.gameCardService.removePlayer(this.gameTitle, this.userName).subscribe();
    }

    ngOnInit() {
        // Game logic to detect if all differences have been found
        this.gameTitle = localStorage.getItem('gameTitle') as string;
        this.userName = localStorage.getItem('userName') as string;
    }
}
