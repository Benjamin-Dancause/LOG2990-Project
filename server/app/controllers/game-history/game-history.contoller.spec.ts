import { Test } from '@nestjs/testing';
import { GameHistoryController } from './game-history.controller';

describe('DatabaseController', () => {
    let gameController: GameHistoryController;

    beforeEach(async () => {
        const app = await Test.createTestingModule({
            controllers: [GameHistoryController],
        }).compile();

        gameController = app.get<GameHistoryController>(GameHistoryController);
    });


});
