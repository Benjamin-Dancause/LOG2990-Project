import { TestBed } from '@angular/core/testing';
import { Message } from '@app/components/text-box/text-box.component';

import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear messages when DeleteMessages is called', () => {
        const message: Message = {
            type: 'opponent',
            timestamp: '123',
            text: 'Hello',
        };

        service.messages.push(message);

        service.deleteMessages();

        expect(service.messages).toEqual([]);
    });
});
