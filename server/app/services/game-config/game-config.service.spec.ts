import { GameConfigService } from './game-config.service';

fdescribe('GameConfigService', () => {
    let gameConfigService: GameConfigService;

    beforeEach(() => {
        gameConfigService = new GameConfigService();
    });

    it('should return the initial countdown time', async () => {
        const countdownTime = await gameConfigService.getCountdownTime();
        expect(countdownTime).toEqual(30);
    });

    it('should set the countdown time', () => {
        gameConfigService.setCountdownTime(20);
        expect(gameConfigService['countdownTime']).toEqual(20);
    });

    it('should return the initial penalty time', async () => {
        const penaltyTime = await gameConfigService.getPenaltyTime();
        expect(penaltyTime).toEqual(5);
    });

    it('should set the penalty time', () => {
        gameConfigService.setPenaltyTime(10);
        expect(gameConfigService['penaltyTime']).toEqual(10);
    });

    it('should return the initial time gained', async () => {
        const timeGained = await gameConfigService.getTimeGained();
        expect(timeGained).toEqual(5);
    });

    it('should set the time gained', () => {
        gameConfigService.setTimeGained(10);
        expect(gameConfigService['timeGained']).toEqual(10);
    });
});
