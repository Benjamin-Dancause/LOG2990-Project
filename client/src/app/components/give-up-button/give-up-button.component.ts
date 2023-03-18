import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// eslint-disable-next-line no-restricted-imports
import { TextBoxComponent } from '@app/components/text-box/text-box.component';
// eslint-disable-next-line import/no-unresolved
import { GameCardService } from '@app/services/game-card.service';
import { WaitingRoomService } from '@app/services/waiting-room.service';

@Component({
    selector: 'app-give-up-button',
    templateUrl: './give-up-button.component.html',
    styleUrls: ['./give-up-button.component.scss'],
    providers: [TextBoxComponent],
})
export class GiveUpButtonComponent implements OnInit {
    @Input() text: string;
    @Input() color: string;
    @ViewChild('giveUpPromptTemplate', { static: true }) giveUpPromptTemplate: TemplateRef<unknown>;
    gameTitle: string;
    userName: string;

    constructor(
        public dialog: MatDialog,
        public textBoxComponent: TextBoxComponent,
        private gameCardService: GameCardService,
        private waitingRoomService: WaitingRoomService,
    ) {}

    giveUpConfirmPrompt(): void {
        this.textBoxComponent.writeQuitMessage();
        this.textBoxComponent.addSystemMessage(`${this.textBoxComponent.getTimestamp()} - ${this.textBoxComponent.userName} a abandonné la partie.`);
        this.dialog.open(this.giveUpPromptTemplate, {
            width: '500px',
            height: '250px',
        });
    }

    removeUser(): void {
        this.waitingRoomService.leaveGame();
        this.gameCardService.removePlayer(this.gameTitle, this.userName).subscribe();
    }

    ngOnInit() {
        // Game logic to detect if all differences have been found
        this.gameTitle = sessionStorage.getItem('gameTitle') as string;
        this.userName = sessionStorage.getItem('userName') as string;
    }
}
