import { Injectable } from '@angular/core';
import { Message } from '@app/components/text-box/text-box.component';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    messages: Message[] = [];

    deleteMessages(): void {
        this.messages = [];
    }
}
