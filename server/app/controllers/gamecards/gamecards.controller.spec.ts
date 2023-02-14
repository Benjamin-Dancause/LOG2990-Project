import { Test, TestingModule } from '@nestjs/testing';
import { GamecardsController } from './gamecards.controller';

describe('GamecardsController', () => {
    let gamecardsController: GamecardsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GamecardsController],
        }).compile();
        gamecardsController = module.get<GamecardsController>(GamecardsController);
    });

    describe('sendAllGamecards', () => {
        it('should return the gamecards that exists', async () => {
            const result = await gamecardsController.sendAllGamecards();
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBeTruthy();
        });
    });
});
