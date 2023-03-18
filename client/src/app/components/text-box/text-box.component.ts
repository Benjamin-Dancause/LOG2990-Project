// eslint-disable-next-line max-classes-per-file
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CounterService } from '@app/services/counter.service';
import { GameService } from '@app/services/game.service';
import { WaitingRoomService } from '@app/services/waiting-room.service';

@Component({
    selector: 'app-text-box',
    templateUrl: './text-box.component.html',
    styleUrls: ['./text-box.component.scss'],
    providers: [CounterService],
})
export class TextBoxComponent implements OnInit {
    @Input() single: boolean = true;
    @Input() solo: boolean;
    //@Input() opponentName: string = '';
    @ViewChild('messageArea') messageArea: ElementRef;

    messages: Message[] = [];
    messageText: string = '';
    userName: string;
    message = '';
    opponentName: string = '';

    constructor(public dialog: MatDialog, private gameService: GameService, private waitingRoomService: WaitingRoomService) {}

    ngOnInit(): void {
        const storedUserName = sessionStorage.getItem('userName');
        this.userName = storedUserName ? storedUserName : '';
        this.setOpponentName();
        this.addSystemMessage(`${this.getTimestamp()} - ${this.userName} a rejoint la partie.`);
        this.addSystemMessage(`${this.getTimestamp()} - L'adversaire a rejoint la partie.`);
        this.waitingRoomService.socket.on('incoming-player-message', (messageInfo: { name: string; message: string }) => {
            if (this.userName === messageInfo.name) {
                this.addSelfMessage(messageInfo.message);
            } else {
                this.addOpponentMessage(messageInfo.message);
            }
        });
        this.waitingRoomService.socket.on('player-quit-game', () => {
            this.writeQuitMessage();
        });
        this.waitingRoomService.socket.on('player-error', (name: string) => {
            this.writeErrorMessage(name);
        });
        this.waitingRoomService.socket.on('player-success', (name: string) => {
            this.writeSucessMessage(name);
        });

        this.gameService.errorMessage.subscribe(() => {
            this.waitingRoomService.sendPlayerError(this.userName);
        });
        this.gameService.successMessage.subscribe(() => {
            this.waitingRoomService.sendPlayerSuccess(this.userName);
        });
    }

    setOpponentName() {
        const gameMaster = sessionStorage.getItem('gameMaster') as string;
        if (gameMaster === this.userName) {
            this.opponentName = sessionStorage.getItem('joiningPlayer') as string;
        } else {
            this.opponentName = sessionStorage.getItem('gameMaster') as string;
        }
    }

    sendMessage() {
        if (this.messageText.trim() === '') return;
        this.waitingRoomService.sendPlayerMessage(this.userName, this.messageText);
        // this.addSelfMessage(this.messageText);
        this.messageText = '';
    }

    addSystemMessage(text: string) {
        const message: Message = {
            type: 'system',
            timestamp: this.getTimestamp(),
            text,
        };
        this.messages.push(message);
        this.scrollMessageArea();
    }

    addOpponentMessage(text: string) {
        const message: Message = {
            type: 'opponent',
            timestamp: this.getTimestamp(),
            text,
        };
        this.messages.push(message);
        this.scrollMessageArea();
    }

    addSelfMessage(text: string) {
        const message: Message = {
            type: 'self',
            timestamp: '',
            text,
        };
        this.messages.push(message);
        this.scrollMessageArea();
    }

    writeQuitMessage() {
        const systemMessage = `${this.getTimestamp()} - ${this.opponentName} à quitté la partie.`;
        this.addSystemMessage(systemMessage);
    }

    writeErrorMessage(name: string) {
        const systemMessage = `${this.getTimestamp()} - Erreur par ${name}`;
        this.addSystemMessage(systemMessage);
    }

    writeSucessMessage(name: string) {
        const systemMessage = `${this.getTimestamp()} - Différence trouvée par ${name}`;
        this.addSystemMessage(systemMessage);
    }

    getTimestamp() {
        const now = new Date();
        const hour = now.getHours().toString().padStart(2, '0');
        const minute = now.getMinutes().toString().padStart(2, '0');
        const second = now.getSeconds().toString().padStart(2, '0');
        return `${hour}:${minute}:${second}`;
    }

    scrollMessageArea() {
        setTimeout(() => {
            const messageAreaEl = this.messageArea.nativeElement as HTMLElement;
            messageAreaEl.scrollTop = messageAreaEl.scrollHeight;
        }, 0);
    }
}

interface Message {
    type: 'system' | 'opponent' | 'self';
    timestamp: string;
    text: string;
}

/*
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-text-box',
    templateUrl: './text-box.component.html',
    styleUrls: ['./text-box.component.scss'],
})
export class TextBoxComponent {
    @ViewChild('messageArea', { static: true }) messageArea!: ElementRef;
    messages: { content: string; type: string }[] = [];
    newMessage: string = '';

    scrollToBottom() {
        setTimeout(() => {
            this.messageArea.nativeElement.scrollTop = this.messageArea.nativeElement.scrollHeight;
        }, 0);
    }

    sendMessage() {
        if (this.newMessage.length > 0) {
            const type = 'self';
            const content = this.newMessage;
            this.messages.push({ content, type });
            this.newMessage = '';
            this.scrollToBottom();
        }
    }
}
*/
