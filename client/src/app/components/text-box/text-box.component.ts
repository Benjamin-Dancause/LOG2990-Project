// eslint-disable-next-line max-classes-per-file
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CounterService } from '@app/services/counter.service';

@Component({
    selector: 'app-text-box',
    templateUrl: './text-box.component.html',
    styleUrls: ['./text-box.component.scss'],
    providers: [CounterService],
})
export class TextBoxComponent implements OnInit {
    @Input() single: boolean = true;
    @Input() solo: boolean;
    @Input() opponentName: string = '';
    @ViewChild('messageArea') messageArea: ElementRef;

    messages: Message[] = [];
    messageText: string = '';
    userName: string;

    constructor(public dialog: MatDialog) {}

    ngOnInit(): void {
        const storedUserName = localStorage.getItem('userName');
        this.userName = storedUserName ? storedUserName : '';
        this.addSystemMessage(`${this.getTimestamp()} - ${this.userName} a rejoint la partie.`);
        this.addSystemMessage(`${this.getTimestamp()} - L'adversaire a rejoint la partie.`);
    }

    sendMessage() {
        if (this.messageText.trim() === '') return;
        this.addSelfMessage(this.messageText);
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
        const systemMessage = `${this.userName} à quitter la partie.`;
        this.addSystemMessage(systemMessage);
    }

    /*
    addQuitMessage(text: string) {
        const message: Message = {
            type: 'system',
            timestamp: this.getTimestamp(),
            text: `${text} a quitté la partie.`,
        };
        this.messages.push(message);
        this.scrollMessageArea();
    }
    */

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

    giveUpConfirmPrompt(): void {
        const dialogRef = this.dialog.open(GiveUpPromptComponent, {
            width: '500px',
            height: '250px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.addSystemMessage(`${this.userName} a quitté la partie.`);
            }
        });
    }
}
export class GiveUpPromptComponent {
    constructor(public dialogRef: MatDialogRef<GiveUpPromptComponent>) {}

    closeDialog(result: boolean) {
        this.dialogRef.close(result);
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
