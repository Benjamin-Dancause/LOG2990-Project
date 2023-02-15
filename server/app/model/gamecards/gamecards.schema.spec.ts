import { Gamecard } from './gamecards.schema';

describe('Gamecard', () => {
    it('should have the correct properties', () => {
        const gamecard = new Gamecard();
        gamecard.title = 'Test Game';
        gamecard.difficulty = 'Easy';
        gamecard.originalImagePath = 'original.jpg';
        gamecard.modifiableImagePath = 'modifiable.jpg';

        expect(gamecard.title).toEqual('Test Game');
        expect(gamecard.difficulty).toEqual('Easy');
        expect(gamecard.originalImagePath).toEqual('original.jpg');
        expect(gamecard.modifiableImagePath).toEqual('modifiable.jpg');
    });
});
