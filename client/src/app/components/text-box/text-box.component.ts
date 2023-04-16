// eslint-disable-next-line max-classes-per-file
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CounterService } from '@app/services/counter/counter.service';
import { GameService } from '@app/services/game/game.service';
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
    gameTitle: string = '';
    successSubscription: Subscription = new Subscription();
    errorSubscription: Subscription = new Subscription();
    recordSubscription: Subscription = new Subscription();
    hintSubscription: Subscription = new Subscription();

    constructor(public gameService: GameService, public socketService: SocketService, public counterService: CounterService) {}
    
    ngOnInit(): void {
        this.gameMode = sessionStorage.getItem('gameMode') as string;
        this.gameTitle = sessionStorage.getItem('gameTitle') as string;
        const storedUserName = sessionStorage.getItem('userName');
        this.userName = storedUserName ? storedUserName : '';
        this.addSystemMessage(`${this.getTimestamp()} - ${this.userName} a rejoint la partie.`);
        const joiner = sessionStorage.getItem('joiningPlayer') as string;
        if (this.gameMode !== 'solo' && joiner) {

            this.multiplayer = true;
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
            this.socketService.socket.off('new-record');
            this.socketService.socket.on('new-record', (recordInfo: {name: string, position: string, title: string, mode: string}) => {
                this.writeNewRecordMessage(recordInfo.name, recordInfo.position, recordInfo.title, recordInfo.mode);
            });

            this.errorSubscription = this.gameService.errorMessage.subscribe(() => {
                this.socketService.sendPlayerError(this.userName);
            });
            this.successSubscription = this.gameService.successMessage.subscribe(() => {
                this.socketService.sendPlayerSuccess(this.userName);
            });
            this.recordSubscription = this.counterService.recordMessage.subscribe((position) => {
                if(this.counterService.counter < this.counterService.counter2) {
                    this.socketService.sendNewRecord(this.opponentName, position, this.gameTitle, this.gameMode);
                }
                else{
                    this.socketService.sendNewRecord(this.userName, position, this.gameTitle, this.gameMode);
                }
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
            this.socketService.socket.off('new-record');
            this.socketService.socket.on('new-record', (recordInfo: {name: string, position: string, title: string, mode: string}) => {
                this.writeNewRecordMessage(recordInfo.name, recordInfo.position, recordInfo.title, recordInfo.mode);
            });
            this.recordSubscription = this.counterService.recordMessage.subscribe((position) => {
                this.socketService.sendNewRecord(this.userName, position, this.gameTitle, this.gameMode);
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

    writeHintMessage() {
        const systemMessage = `${this.getTimestamp()} -  Indice utilisé`;
        this.addSystemMessage(systemMessage);
    }

    writeNewRecordMessage(name: string, position: string, title: string, mode: string) {
        const systemMessage = `${this.getTimestamp()} - ${name} obtient la ${position} place dans les meilleurs temps du jeu ${title} en ${mode}`;
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
