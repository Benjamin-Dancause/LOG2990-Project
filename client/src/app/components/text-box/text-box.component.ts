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
