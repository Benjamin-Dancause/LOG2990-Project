import { Message } from './message.schema';

describe('Message', () => {
    it('should create a message with a title and a body', () => {
        const title = 'title name';
        const body = 'body of the message';
        const message = new Message();

        message.title = title;
        message.body = body;

        expect(message.title).toEqual(title);
        expect(message.body).toEqual(body);
    });
});
