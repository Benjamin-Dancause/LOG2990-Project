// eslint-disable-next-line max-classes-per-file
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CounterService } from '@app/services/counter.service';
import { GameService } from '@app/services/game.service';
import { SocketService } from '@app/services/socket.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-text-box',
    templateUrl: './text-box.component.html',
    styleUrls: ['./text-box.component.scss'],
    providers: [CounterService],
})
export class TextBoxComponent implements OnInit, OnDestroy {
    @Input() single: boolean = true;
    @Input() solo: boolean;
    //@Input() opponentName: string = '';
    @ViewChild('messageArea') messageArea: ElementRef;

    messages: Message[] = [];
    messageText: string = '';
    userName: string;
    message = '';
    opponentName: string = '';
    gameMode: string = '';
    successSubscription: Subscription;
    errorSubscription: Subscription;

    constructor(public dialog: MatDialog, private gameService: GameService, private socketService: SocketService) {
        this.gameMode = sessionStorage.getItem('gameMode') as string;
        this.errorSubscription = new Subscription();
        this.errorSubscription = new Subscription();
    }

    ngOnInit(): void {
        const storedUserName = sessionStorage.getItem('userName');
        this.userName = storedUserName ? storedUserName : '';
        this.addSystemMessage(`${this.getTimestamp()} - ${this.userName} a rejoint la partie.`);

        if (this.gameMode !== 'solo') {
            this.setOpponentName();
            this.addSystemMessage(`${this.getTimestamp()} - ${this.opponentName} a rejoint la partie.`);
            this.socketService.socket.on('incoming-player-message', (messageInfo: { name: string; message: string }) => {
                if (this.userName === messageInfo.name) {
                    this.addSelfMessage(messageInfo.message);
                } else {
                    this.addOpponentMessage(messageInfo.message);
                }
            });
            this.socketService.socket.on('player-quit-game', () => {
                this.writeQuitMessage();
            });
            this.socketService.socket.on('player-error', (name: string) => {
                this.writeErrorMessage(name);
            });
            this.socketService.socket.on('player-success', (name: string) => {
                this.writeSuccessMessage(name);
            });

            this.errorSubscription = this.gameService.errorMessage.subscribe(() => {
                this.socketService.sendPlayerError(this.userName);
            });
            this.successSubscription = this.gameService.successMessage.subscribe(() => {
                this.socketService.sendPlayerSuccess(this.userName);
            });
        } else {
            this.errorSubscription = this.gameService.errorMessage.subscribe(() => {
                this.writeErrorMessage(this.userName);
            });
            this.successSubscription = this.gameService.successMessage.subscribe(() => {
                this.writeSuccessMessage(this.userName);
            });
        }
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
        this.socketService.sendPlayerMessage(this.userName, this.messageText);
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
        let systemMessage = `${this.getTimestamp()} - Erreur`;
        if (this.gameMode !== 'solo') {
            systemMessage += ` par ${name}`;
        }
        this.addSystemMessage(systemMessage);
    }

    writeSuccessMessage(name: string) {
        let systemMessage = `${this.getTimestamp()} - Différence trouvée`;
        if (this.gameMode !== 'solo') {
            systemMessage += ` par ${name}`;
        }
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

    ngOnDestroy(): void {
        if (this.errorSubscription) {
            this.errorSubscription.unsubscribe();
        }
        if (this.successSubscription) {
            this.successSubscription.unsubscribe();
        }
        sessionStorage.clear();
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
