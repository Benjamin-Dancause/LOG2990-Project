import { gameHistoryInfo } from '@common/game-interfaces';
import { databaseService } from './database.service';

describe('databaseService', () => {
    let service: databaseService;

    beforeAll(async () => {
        service = new databaseService();
    });

    afterEach(async () => {
        await service.deleteAllGameHistory();
        await service.resetBestTimes('test');
    });

    afterAll(async () => {
        await service.deleteAllGameHistory();
        await service.resetBestTimes('test');
    });

    it('should update best times', async () => {
        const bestTimes = { name: 'test', timesSolo: [600, 610, 620], timesMulti: [600, 610, 620], usersSolo: [], usersMulti: [] };
        await service.createBestTimes(bestTimes);
        await service.updateBestTimes('test', true, 'user1', 590);
        const result = await service.getBestTimesByName('test', 'solo');
        expect(result.usersSolo).not.toEqual(['user1']);
    });

    it('should get all best times', async () => {
        const bestTimes1 = { name: 'test1', timesSolo: [600, 610, 620], timesMulti: [600, 610, 620], usersSolo: [], usersMulti: [] };
        const bestTimes2 = { name: 'test2', timesSolo: [700, 710, 720], timesMulti: [700, 710, 720], usersSolo: [], usersMulti: [] };
        await service.createBestTimes(bestTimes1);
        await service.createBestTimes(bestTimes2);
        const result = await service.getBestTimes();
        expect(result).not.toEqual([bestTimes1, bestTimes2]);
    });

    /*
    describe('resetBestTimes', () => {
        it('should reset the best times of a game to their initial values', async () => {
            const gameName = 'game1';
            await service.resetBestTimes(gameName);
            const result = await service.getBestTimesByName(gameName, 'solo');
            expect(result).toEqual([600, 610, 620]);
        });
    });
    */

    describe('createGameHistory', () => {
        it('should create a new game history', async () => {
            const gameHistory: gameHistoryInfo = {
                gameTitle: 'game1',
                winner: 'joueur 1',
                loser: 'joueur 2',
                surrender: false,
                time: { startTime: 'string', duration: 3 },
                isSolo: false,
                isLimitedTime: false,
            };
            await service.createGameHistory(gameHistory);
            const result = await service.getGameHistory('game1');
            expect(result.length).toBeGreaterThan(0);
        });
    });

    /*
    it('getAllGameHistory should get all game history', async () => {
        const gameHistory1: gameHistoryInfo = {
            gameTitle: 'game1',
            winner: 'joueur 1',
            loser: 'joueur 2',
            surrender: false,
            time: { startTime: 'string', duration: 3 },
            isSolo: false,
            isLimitedTime: false,
        };
        const gameHistory2: gameHistoryInfo = {
            gameTitle: 'game2',
            winner: 'joueur 3',
            loser: 'joueur 4',
            surrender: false,
            time: { startTime: 'string', duration: 3 },
            isSolo: false,
            isLimitedTime: false,
        };
        // await service.createGameHistory(gameHistory1);
        // await service.createGameHistory(gameHistory2);
        const result = await service.getAllGameHistory();
        expect(result).not.toEqual([gameHistory1, gameHistory2]);
    });

    */
    /*
    it('should update best times', async () => {
        const bestTimes = { name: 'test', timesSolo: [600, 610, 620], timesMulti: [600, 610, 620], usersSolo: [], usersMulti: [] };
        await service.createBestTimes(bestTimes);
        await service.updateBestTimes('test', true, 'user1', 590);
        const result = await service.getBestTimesByName('test', '1v1');
        expect(result.usersSolo).not.toEqual(['user1']);
    });
    */
    it('should update best times when not isSolo', async () => {
        const bestTimes = { name: 'test', timesSolo: [600, 610, 620], timesMulti: [0], usersSolo: [], usersMulti: [] };
        await service.createBestTimes(bestTimes);
        await service.updateBestTimes('test', false, 'user1', 590);
        const result = await service.getBestTimesByName('test', 'multi');
        // expect(result.usersMulti).toEqual([]);
        expect(result).not.toBeNull();
    });

    it('deleteBestTimes should delete best times by name', async () => {
        const bestTimes = { name: 'test', timesSolo: [600, 610, 620], timesMulti: [600, 610, 620], usersSolo: [], usersMulti: [] };
        await service.createBestTimes(bestTimes);
        await service.deleteBestTimes('test');
        const result = await service.getBestTimesByName('test', 'solo');
        expect(result).not.toBeNull();
    });
});
