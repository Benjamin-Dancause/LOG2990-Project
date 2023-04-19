import { TIME } from '@common/constants';
import { GameConfigService } from './game-config.service';

describe('GameConfigService', () => {
    let gameConfigService: GameConfigService;

    beforeEach(() => {
        gameConfigService = new GameConfigService();
    });

    it('should return the initial countdown time', async () => {
        const countdownTime = await gameConfigService.getCountdownTime();
        expect(countdownTime).toEqual(TIME.COUNTDOWN_TIME);
    });

    it('should set the countdown time', () => {
        gameConfigService.setCountdownTime(TIME.MEDIUM_COUNTDOWN_TIME);
        expect(gameConfigService['countdownTime']).toEqual(TIME.MEDIUM_COUNTDOWN_TIME);
    });

    it('should return the initial penalty time', async () => {
        const penaltyTime = await gameConfigService.getPenaltyTime();
        expect(penaltyTime).toEqual(TIME.SMALL_PENALTY);
    });

    it('should set the penalty time', () => {
        gameConfigService.setPenaltyTime(TIME.SMALL_ADD_TIME);
        expect(gameConfigService['penaltyTime']).toEqual(TIME.SMALL_ADD_TIME);
    });

    it('should return the initial time gained', async () => {
        const timeGained = await gameConfigService.getTimeGained();
        expect(timeGained).toEqual(TIME.SMALL_TIME_GAINED);
    });

    it('should set the time gained', () => {
        gameConfigService.setTimeGained(TIME.SMALL_ADD_TIME);
        expect(gameConfigService['timeGained']).toEqual(TIME.SMALL_ADD_TIME);
    });
});
