// eslint-disable-next-line no-restricted-imports
import * as fs from 'fs/promises';
import { StoreService } from '../store/store.service';
import { GameManager } from './game-manager.service';

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

    it('loadGame should load game data and return new images', async () => {
        const roomId = 'room1';
        const gameTitles = ['game1'];
        const expectedImages = ['image1.jpg', 'image2.jpg'];
        jest.spyOn(fs, 'readFile').mockResolvedValueOnce(
            JSON.stringify([
                {
                    name: 'game1',
                    count: 5,
                    differences: [],
                    images: expectedImages,
                },
            ]),
        );

        const newImages = await gameManager.loadGame(roomId, gameTitles);
        expect(newImages).toEqual(expectedImages);
    });
});
