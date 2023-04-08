import { promises as fs } from 'fs';
// eslint-disable-next-line no-restricted-imports
import { StoreService } from '../store/store.service';
import { GameManager } from './game-config.service';

describe('GameManager', () => {
    let gameManager: GameManager;

    beforeEach(() => {
        const storeService = new StoreService();
        gameManager = new GameManager(storeService);
    });

    describe('createGame', () => {
        it('should return the count from the gameData object', () => {
            const gameData = { id: 1, count: 5, differences: [] };
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect(gameManager.createGame(gameData)).toBe(5);
        });
    });

    describe('verifyPos', () => {
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

            const expectedDifference = { isDifference: false, differenceNumber: 0, coords: [] };
            const differenceInterface = await gameManager.verifyPos(gameName, clickCoord);
            expect(differenceInterface).toEqual(expectedDifference);
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

    afterEach(() => {
        jest.restoreAllMocks();
    });
});
