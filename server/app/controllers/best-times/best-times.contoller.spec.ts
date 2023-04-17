import { databaseService } from '@app/services/database/database.service';
import { playerTime } from '@common/game-interfaces';
import { Test } from '@nestjs/testing';
import { BestTimesController } from './best-times.controller';

describe('BestTimesController', () => {
    let gameController: BestTimesController;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let databaseServiceMock: any;

    beforeEach(async () => {
        databaseServiceMock = {
            getBestTimes: jest.fn(),
            getBestTimesByName: jest.fn(),
            setup: jest.fn(),
            updateBestTimes: jest.fn(),
            deleteBestTimes: jest.fn(),
            resetBestTimes: jest.fn(),
        };

        const app = await Test.createTestingModule({
            controllers: [BestTimesController],
            providers: [
                {
                    provide: databaseService,
                    useValue: databaseServiceMock,
                },
            ],
        }).compile();

        gameController = app.get<BestTimesController>(BestTimesController);
    });

    /*
    describe('getAllTimes', () => {
        it('should call databaseService.getBestTimes and return the result', async () => {
            const expected: bestTimes[] = [{ gameTitle: 'game1', gameMode: 'solo', times: [] }];
            databaseServiceMock.getBestTimes.mockReturnValue(of(expected));

            const result = await gameController.getAllTimes();

            expect(databaseServiceMock.getBestTimes).toHaveBeenCalled();
            expect(result).toEqual(expected);
        });
    });

    describe('getTimes', () => {
        it('should call databaseService.getBestTimesByName with the correct parameters and return the result', async () => {
            const gameTitle = 'game1';
            const gameMode = 'solo';
            name: string;
    usersSolo: string[];
    usersMulti: string[];
    timesSolo: number[];
    timesMulti: number[];
            const expected: bestTimes = { 'game1', gameMode, times: [] };
            databaseServiceMock.getBestTimesByName.mockReturnValue(of(expected));

            const result = await gameController.getTimes(gameTitle, gameMode);

            expect(databaseServiceMock.getBestTimesByName).toHaveBeenCalledWith(gameTitle, gameMode);
            expect(result).toEqual(expected);
        });
    });
    */

    describe('resetAllBestTimes', () => {
        it('should call databaseService.setup', async () => {
            gameController.resetAllBestTimes();

            expect(databaseServiceMock.setup).toHaveBeenCalled();
        });
    });

    describe('updateTimes', () => {
        it('should call databaseService.updateBestTimes with the correct parameters', async () => {
            const gameTitle = 'game1';
            const playerTime: playerTime = { isSolo: true, user: 'user1', time: 123 };
            gameController.updateTimes(gameTitle, playerTime);

            expect(databaseServiceMock.updateBestTimes).toHaveBeenCalledWith(gameTitle, true, 'user1', 123);
        });
    });

    describe('deleteTimes', () => {
        it('should call databaseService.deleteBestTimes with the correct parameter', async () => {
            const gameTitle = 'game1';
            gameController.deleteTimes(gameTitle);

            expect(databaseServiceMock.deleteBestTimes).toHaveBeenCalledWith(gameTitle);
        });
    });

    describe('resetBestTimes', () => {
        it('should call databaseService.resetBestTimes with the correct parameter', async () => {
            const gameTitle = 'game1';
            gameController.resetBestTimes(gameTitle);

            expect(databaseServiceMock.resetBestTimes).toHaveBeenCalledWith(gameTitle);
        });
    });
});
