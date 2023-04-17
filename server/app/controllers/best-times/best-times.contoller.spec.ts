import { databaseService } from '@app/services/database/database.service';
import { Test, TestingModule } from '@nestjs/testing';
import { BestTimesController } from './best-times.controller';

describe('BestTimesController', () => {
    let controller: BestTimesController;
    let databaseServiceMock: Partial<databaseService>;

    beforeEach(async () => {
        databaseServiceMock = {
            getBestTimes: jest.fn().mockReturnValue(Promise.resolve([{ gameTitle: 'game1', gameMode: 'mode1', times: [] }])),
            getBestTimesByName: jest.fn().mockReturnValue(Promise.resolve({ gameTitle: 'game1', gameMode: 'mode1', times: [] })),
            setup: jest.fn(),
            updateBestTimes: jest.fn(),
            deleteBestTimes: jest.fn(),
            resetBestTimes: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [BestTimesController],
            providers: [{ provide: databaseService, useValue: databaseServiceMock }],
        }).compile();

        controller = module.get<BestTimesController>(BestTimesController);
    });

    describe('getAllTimes', () => {
        it('should return an array of bestTimes', async () => {
            const result = await controller.getAllTimes();

            expect(databaseServiceMock.getBestTimes).toHaveBeenCalled();
            expect(result).toEqual([{ gameTitle: 'game1', gameMode: 'mode1', times: [] }]);
        });
    });

    describe('getTimes', () => {
        it('should return bestTimes for a given gameTitle and gameMode', async () => {
            const result = await controller.getTimes('game1', 'mode1');

            expect(databaseServiceMock.getBestTimesByName).toHaveBeenCalledWith('game1', 'mode1');
            expect(result).toEqual({ gameTitle: 'game1', gameMode: 'mode1', times: [] });
        });
    });

    describe('resetAllBestTimes', () => {
        it('should call setup method of databaseService', () => {
            controller.resetAllBestTimes();

            expect(databaseServiceMock.setup).toHaveBeenCalled();
        });
    });

    describe('updateTimes', () => {
        it('should call updateBestTimes method of databaseService', () => {
            const playerTime = { isSolo: true, user: 'John', time: 60 };

            controller.updateTimes('game1', playerTime);

            expect(databaseServiceMock.updateBestTimes).toHaveBeenCalledWith('game1', true, 'John', 60);
        });
    });

    describe('deleteTimes', () => {
        it('should call deleteBestTimes method of databaseService', () => {
            controller.deleteTimes('game1');

            expect(databaseServiceMock.deleteBestTimes).toHaveBeenCalledWith('game1');
        });
    });

    describe('resetBestTimes', () => {
        it('should call resetBestTimes method of databaseService', () => {
            controller.resetBestTimes('game1');

            expect(databaseServiceMock.resetBestTimes).toHaveBeenCalledWith('game1');
        });
    });
});