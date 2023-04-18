import { GameConfigService } from '@app/services/game-config/game-config.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameConfigController } from './game-config.controller';

describe('GameConfigController', () => {
    let controller: GameConfigController;
    let gameConfigService: GameConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameConfigController],
            providers: [GameConfigService],
        }).compile();

        controller = module.get<GameConfigController>(GameConfigController);
        gameConfigService = module.get<GameConfigService>(GameConfigService);
    });

    describe('getCountdownTime', () => {
        it('should return countdownTime', async () => {
            const countdownTime = 30;
            jest.spyOn(gameConfigService, 'getCountdownTime').mockReturnValue(await Promise.resolve(countdownTime));

            expect(await controller.getCountdownTime()).toEqual(countdownTime);
        });
    });

    describe('setCountdownTime', () => {
        it('should set countdownTime', async () => {
            const countdownTime = 60;
            jest.spyOn(gameConfigService, 'setCountdownTime');

            await controller.setCountdownTime(countdownTime);

            expect(gameConfigService.setCountdownTime).toHaveBeenCalledWith(countdownTime);
        });
    });

    describe('getPenaltyTime', () => {
        it('should return penaltyTime', async () => {
            const penaltyTime = 5;
            jest.spyOn(gameConfigService, 'getPenaltyTime').mockReturnValue(await Promise.resolve(penaltyTime));

            expect(await controller.getPenaltyTime()).toEqual(penaltyTime);
        });
    });

    describe('setPenaltyTime', () => {
        it('should set penaltyTime', async () => {
            const penaltyTime = 10;
            jest.spyOn(gameConfigService, 'setPenaltyTime');

            await controller.setPenaltyTime(penaltyTime);

            expect(gameConfigService.setPenaltyTime).toHaveBeenCalledWith(penaltyTime);
        });
    });

    describe('getTimeGained', () => {
        it('should return timeGained', async () => {
            const timeGained = 5;
            jest.spyOn(gameConfigService, 'getTimeGained').mockReturnValue(await Promise.resolve(timeGained));

            expect(await controller.getTimeGained()).toEqual(timeGained);
        });
    });

    describe('setTimeGained', () => {
        it('should set timeGained', async () => {
            const timeGained = 10;
            jest.spyOn(gameConfigService, 'setTimeGained');

            await controller.setTimeGained(timeGained);

            expect(gameConfigService.setTimeGained).toHaveBeenCalledWith(timeGained);
        });
    });
});
