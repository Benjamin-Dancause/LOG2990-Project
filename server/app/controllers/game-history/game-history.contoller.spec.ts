// eslint-disable @typescript-eslint/no-shadow
import { DatabaseService } from '@app/services/database/database.service';
import { GameHistoryInfo } from '@common/game-interfaces';
import { Test } from '@nestjs/testing';
import { GameHistoryController } from './game-history.controller';

describe('GameHistoryController', () => {
    let gameController: GameHistoryController;
    let databaseServiceMock: Partial<DatabaseService>;

    beforeEach(async () => {
        databaseServiceMock = {
            getAllGameHistory: jest.fn(),
            getGameHistory: jest.fn(),
            createGameHistory: jest.fn(),
            deleteAllGameHistory: jest.fn(),
        };

        const app = await Test.createTestingModule({
            controllers: [GameHistoryController],
            providers: [{ provide: DatabaseService, useValue: databaseServiceMock }],
        }).compile();

        gameController = app.get<GameHistoryController>(GameHistoryController);
    });

    describe('getAllHistory', () => {
        it('should call DatabaseService.getAllGameHistory', async () => {
            const expectedGameHistory: GameHistoryInfo[] = [
                {
                    gameTitle: 'game1',
                    winner: 'joueur 1',
                    loser: 'joueur 2',
                    surrender: false,
                    time: { startTime: 'string', duration: 3 },
                    isSolo: false,
                    isLimitedTime: false,
                },
            ];

            databaseServiceMock.getAllGameHistory = jest.fn(async () => Promise.resolve(expectedGameHistory));

            const result = await gameController.getAllHistory();

            expect(databaseServiceMock.getAllGameHistory).toHaveBeenCalled();
            expect(result).toEqual(expectedGameHistory);
        });
    });

    describe('getHistory', () => {
        it('should call DatabaseService.getGameHistory with the provided gameTitle', async () => {
            const gameTitle = 'game1';
            const expectedGameHistory: GameHistoryInfo[] = [
                {
                    gameTitle: 'game1',
                    winner: 'joueur 1',
                    loser: 'joueur 2',
                    surrender: false,
                    time: { startTime: 'string', duration: 3 },
                    isSolo: false,
                    isLimitedTime: false,
                },
            ];

            databaseServiceMock.getGameHistory = jest.fn(async () => Promise.resolve(expectedGameHistory));

            const result = await gameController.getHistory(gameTitle);

            expect(databaseServiceMock.getGameHistory).toHaveBeenCalledWith(gameTitle);
            expect(result).toEqual(expectedGameHistory);
        });
    });

    describe('createGameHistory', () => {
        it('should call DatabaseService.createGameHistory with the provided gameHistoryInfo', () => {
            const gameHistoryInfo: GameHistoryInfo = {
                gameTitle: 'game1',
                winner: 'joueur 1',
                loser: 'joueur 2',
                surrender: false,
                time: { startTime: 'string', duration: 3 },
                isSolo: false,
                isLimitedTime: false,
            };

            gameController.createGameHistory(gameHistoryInfo);

            expect(databaseServiceMock.createGameHistory).toHaveBeenCalledWith(gameHistoryInfo);
        });
    });

    describe('deleteHistory', () => {
        it('should call DatabaseService.deleteAllGameHistory', () => {
            gameController.deleteHistory();

            expect(databaseServiceMock.deleteAllGameHistory).toHaveBeenCalled();
        });
    });
});
