/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GameHistoryInfo } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoClient } from 'mongodb';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
    let service: DatabaseService;
    let client: MongoClient;
    const mongoUrl = 'mongodb+srv://equipe210:differences210@2990-210.po0vcim.mongodb.net/?retryWrites=true&w=majority';
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [DatabaseService],
        }).compile();

        service = module.get<DatabaseService>(DatabaseService);
    });

    beforeEach(async () => {
        client = new MongoClient(mongoUrl);
        await service.setup();
    });

    afterEach(async () => {
        await client.close();
    });

    afterAll(async () => {
        await module.close();
    });

    it('should update best times for solo game and for 1v1 game', async () => {
        const bestTimes = {
            name: 'testGame',
            timesSolo: [600, 610, 620],
            timesMulti: [600, 610, 620],
            usersSolo: ['fake1', 'fake2', 'fake3'],
            usersMulti: ['fake1', 'fake2', 'fake3'],
        };

        await service.createBestTimes(bestTimes);

        await service.updateBestTimes('testGame', true, 'user1', 590);
        const resultSolo = await service.getBestTimesByName('testGame', 'solo');
        expect(resultSolo[0]).toEqual(590);

        await service.updateBestTimes('testGame', false, 'user1', 590);
        const result1v1 = await service.getBestTimesByName('testGame', '1v1');
        expect(result1v1[0]).toEqual(590);
    });

    it('should get all best times', async () => {
        const bestTimes1 = {
            name: 'test1',
            timesSolo: [600, 610, 620],
            timesMulti: [600, 610, 620],
            usersSolo: ['fake1', 'fake2', 'fake3'],
            usersMulti: ['fake1', 'fake2', 'fake3'],
        };
        const bestTimes2 = {
            name: 'test2',
            timesSolo: [700, 710, 720],
            timesMulti: [700, 710, 720],
            usersSolo: ['fake1', 'fake2', 'fake3'],
            usersMulti: ['fake1', 'fake2', 'fake3'],
        };
        await service.createBestTimes(bestTimes1);
        await service.createBestTimes(bestTimes2);
        const result = await service.getBestTimes();
        expect(result).not.toEqual([bestTimes1, bestTimes2]);
    });

    it('should reset the best times of a game to their initial values', async () => {
        const bestTimes = {
            name: 'testReset',
            timesSolo: [30, 60, 70],
            timesMulti: [60, 70, 80],
            usersSolo: ['fake1', 'fake2', 'fake3'],
            usersMulti: ['fake1', 'fake2', 'fake3'],
        };
        await service.createBestTimes(bestTimes);
        await service.resetBestTimes(bestTimes.name);
        const result = await service.getBestTimesByName(bestTimes.name, 'solo');
        expect(result).toEqual([600, 610, 620]);
    });

    it('should create a new game history', async () => {
        const gameHistory: GameHistoryInfo = {
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

    it('getAllGameHistory should get all game history', async () => {
        const gameHistory1: GameHistoryInfo = {
            gameTitle: 'game1',
            winner: 'joueur 1',
            loser: 'joueur 2',
            surrender: false,
            time: { startTime: 'string', duration: 3 },
            isSolo: false,
            isLimitedTime: false,
        };
        const gameHistory2: GameHistoryInfo = {
            gameTitle: 'game2',
            winner: 'joueur 3',
            loser: 'joueur 4',
            surrender: false,
            time: { startTime: 'string', duration: 3 },
            isSolo: false,
            isLimitedTime: false,
        };
        await service.createGameHistory(gameHistory1);
        await service.createGameHistory(gameHistory2);
        const result = await service.getAllGameHistory();
        expect(result).toEqual([gameHistory1, gameHistory2]);
    });

    it('deleteBestTimes should delete best times by name', async () => {
        const bestTimes = {
            name: 'testDelete',
            timesSolo: [600, 610, 620],
            timesMulti: [600, 610, 620],
            usersSolo: ['fake1', 'fake2', 'fake3'],
            usersMulti: ['fake1', 'fake2', 'fake3'],
        };
        await service.createBestTimes(bestTimes);
        await service.deleteBestTimes('testDelete');
        const games = await service.getBestTimes();
        for (const game of games) {
            expect(game.name).not.toEqual(bestTimes.name);
        }
    });

    it('deleteAllGameHistory should delete all game history', async () => {
        const gameHistory: GameHistoryInfo = {
            gameTitle: 'game1',
            winner: 'joueur 1',
            loser: 'joueur 2',
            surrender: false,
            time: { startTime: 'string', duration: 3 },
            isSolo: false,
            isLimitedTime: false,
        };
        await service.createGameHistory(gameHistory);
        await service.deleteAllGameHistory();
        const result = await service.getAllGameHistory();
        expect(result).toEqual([]);
    });

    it('bubbleUp should return -1 if the new time is not part of the array', async () => {
        const testArray = [50, 60, 70];
        const bubble = 80;
        const result = await service.bubbleUp(testArray, bubble);
        expect(result).toEqual(-1);
    });

    it('bubbleTo should swap new time to correct position in the array', async () => {
        const testArray = [50, 60, 70];
        const originalIndex = 1;
        const destinationIndex = 2;

        jest.spyOn(service, 'swap');

        await service.bubbleTo(testArray, originalIndex, destinationIndex);
        expect(service.swap).toHaveBeenCalled();
    });

    it('bubbleTo should swap old time to new position in the array', async () => {
        const testArray = [50, 60, 70];
        const originalIndex = 2;
        const destinationIndex = 0;

        jest.spyOn(service, 'swap');

        await service.bubbleTo(testArray, originalIndex, destinationIndex);
        expect(service.swap).toHaveBeenCalled();
    });
});
