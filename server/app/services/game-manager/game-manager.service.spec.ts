import { promises as fs } from 'fs';
import { StoreService } from '../store/store.service';
import { DifferenceInterface, GameManager } from './game-manager.service';

describe('GameManager', () => {
    let gameManager: GameManager;
    let storeService: StoreService;

    beforeEach(() => {
        storeService = new StoreService();
        gameManager = new GameManager(storeService);
    });

    describe('verifyPos', () => {
        it('should return an object indicating a difference was found if the click is on a difference', async () => {
            const gameName = 'test_game';
            const clickCoord = { x: 1, y: 2 };
            const gameData = {
                name: gameName,
                differences: [
                    [
                        { x: 1, y: 2 },
                        { x: 3, y: 4 },
                    ],
                    [
                        { x: 5, y: 6 },
                        { x: 7, y: 8 },
                        { x: 9, y: 10 },
                    ],
                ],
            };
            const gamesContent = [{ name: gameName, differences: gameData.differences }];
            jest.spyOn(fs, 'readFile').mockImplementation(async () => Promise.resolve(JSON.stringify(gamesContent)));
            const expected: DifferenceInterface = {
                isDifference: true,
                differenceNumber: 1,
                coords: [
                    { x: 1, y: 2 },
                    { x: 3, y: 4 },
                ],
            };
            const result = await gameManager.verifyPos(gameName, clickCoord);
            expect(result).toEqual(expected);
        });

        it('should return an object indicating that no difference was found if the click is not on a difference', async () => {
            const gameName = 'test_game';
            const clickCoord = { x: 1, y: 2 };
            const gameData = {
                name: gameName,
                differences: [
                    [
                        { x: 3, y: 4 },
                        { x: 5, y: 6 },
                    ],
                    [
                        { x: 7, y: 8 },
                        { x: 9, y: 10 },
                    ],
                ],
            };
            const gamesContent = [{ name: gameName, differences: gameData.differences }];
            jest.spyOn(fs, 'readFile').mockImplementation(async () => Promise.resolve(JSON.stringify(gamesContent)));

            const expected: DifferenceInterface = {
                isDifference: false,
                differenceNumber: 0,
                coords: [],
            };
            const result = await gameManager.verifyPos(gameName, clickCoord);
            expect(result).toEqual(expected);
        });
    });

    describe('createGame', () => {
        it('should return the amount of differences for games', async () => {
            const gameData = {
                id: 1,
                count: 5,
                differences: [
                    [
                        { x: 1, y: 2 },
                        { x: 3, y: 4 },
                    ],
                    [
                        { x: 5, y: 6 },
                        { x: 7, y: 8 },
                        { x: 9, y: 10 },
                    ],
                ],
            };
            const result = gameManager.createGame(gameData);
            expect(result).toEqual(gameData.count);
        });
    });

    /*
    afterEach(() => {
        jest.restoreAllMocks();
    });
    */
});
