// eslint-disable-next-line max-classes-per-file
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';
import { CounterService } from '@app/services/counter/counter.service';
import { GameService } from '@app/services/game/game.service';
import { ReplayService } from '@app/services/replay/replay.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-text-box',
    templateUrl: './text-box.component.html',
    styleUrls: ['./text-box.component.scss'],
})
export class TextBoxComponent implements OnInit, OnDestroy {
    @Input() single: boolean = true;
    @Input() solo: boolean;
    @ViewChild('messageArea') messageArea: ElementRef;

    messages: Message[] = [];
    messageText: string = '';
    userName: string;
    message = '';
    opponentName: string = '';
    multiplayer: boolean = false;
    gameMode: string = '';
    successSubscription: Subscription;
    errorSubscription: Subscription;
    recordSubscription: Subscription;
    hintSubscription: Subscription;

    constructor(
        public gameService: GameService,
        public socketService: SocketService,
        public counterService: CounterService,
        public chat: ChatService,
        public replay: ReplayService,
    ) {
        this.gameMode = sessionStorage.getItem('gameMode') as string;
        this.errorSubscription = new Subscription();
        this.successSubscription = new Subscription();
        this.recordSubscription = new Subscription();
        this.hintSubscription = new Subscription();
    }

    ngOnInit(): void {
        this.chat.deleteMessages();
        const storedUserName = sessionStorage.getItem('userName');
        this.userName = storedUserName ? storedUserName : '';
        this.addSystemMessage(`${this.getTimestamp()} - ${this.userName} a rejoint la partie.`);
        const joiner = sessionStorage.getItem('joiningPlayer') as string;
        // console.log(joiner);
        if (this.gameMode !== 'solo' && joiner) {
            this.multiplayer = true;
            this.setOpponentName();
            // console.log('Opponent Name: ' + this.opponentName);
            this.addSystemMessage(`${this.getTimestamp()} - ${this.opponentName} a rejoint la partie.`);
            this.socketService.socket.off('incoming-player-message');
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
            this.socketService.socket.on('new-record', (name: string) => {
                this.writeNewRecordMessage(name);
            });

            this.errorSubscription = this.gameService.errorMessage.subscribe(() => {
                this.socketService.sendPlayerError(this.userName);
            });
            this.successSubscription = this.gameService.successMessage.subscribe(() => {
                this.socketService.sendPlayerSuccess(this.userName);
            });
            this.recordSubscription = this.counterService.recordMessage.subscribe(() => {
                this.socketService.sendNewRecord(this.userName);
            });
            this.socketService.socket.on('player-quit-game', () => {
                this.multiplayer = false;
            });
        } else {
            this.errorSubscription = this.gameService.errorMessage.subscribe(() => {
                this.writeErrorMessage(this.userName);
            });
            this.successSubscription = this.gameService.successMessage.subscribe(() => {
                this.writeSuccessMessage(this.userName);
            });
            this.hintSubscription = this.gameService.hintMessage.subscribe(() => {
                this.writeHintMessage();
            });
            this.recordSubscription = this.counterService.recordMessage.subscribe(() => {
                this.writeNewRecordMessage(this.userName);
            });
        }
    }

    setOpponentName() {
        const gameMaster = sessionStorage.getItem('gameMaster') as string;
        if (sessionStorage.getItem('joininPlayer') as string) {
            this.multiplayer = true;
        }
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
        this.chat.messages.push(message);
        this.replay.addAction(this.gameService.time, 'message', message);
        this.scrollMessageArea();
    }

    addOpponentMessage(text: string) {
        const message: Message = {
            type: 'opponent',
            timestamp: this.getTimestamp(),
            text,
        };
        this.chat.messages.push(message);
        this.replay.addAction(this.gameService.time, 'message', message);
        this.scrollMessageArea();
    }

    addSelfMessage(text: string) {
        const message: Message = {
            type: 'self',
            timestamp: '',
            text,
        };
        this.chat.messages.push(message);
        this.replay.addAction(this.gameService.time, 'message', message);
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

    writeHintMessage() {
        const systemMessage = `${this.getTimestamp()} -  Indice utilisé`;
        this.addSystemMessage(systemMessage);
    }

    writeNewRecordMessage(name: string) {
        const systemMessage = `${this.getTimestamp()} - ${name} obtient la POSITION place dans les meilleurs temps du jeu ${name} en ${
            this.gameMode
        }`;
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
        if (this.recordSubscription) {
            this.recordSubscription.unsubscribe();
        }
        sessionStorage.clear();
        this.chat.deleteMessages();
    }
}

export interface Message {
    type: 'system' | 'opponent' | 'self';
    timestamp: string;
    text: string;
}
