// eslint-disable-next-line no-restricted-imports
import { StoreService } from '@app/services/store/store.service';
import { GameDiffData, RoomGameData } from '@common/game-interfaces';
import * as fs from 'fs/promises';
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

        it('should return 0 when gameData is falsy', () => {
            // Arrange
            const gameData = null;

            // Act
            const result = gameManager.createGame(gameData);

            // Assert
            expect(result).toBe(0);
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
        expect(newImages.images).toEqual(expectedImages);
    });

    describe('switchGame', () => {
        const roomId = 'room1';
        const gameName = 'testGame';
        const expectedImages = ['image1.jpg', 'image2.jpg'];

        beforeEach(() => {
            jest.spyOn(gameManager, 'switchData').mockReturnValue(1);
            jest.spyOn(gameManager, 'switchImages').mockReturnValue({images: expectedImages, title: gameName});
        });

        it('should return the remaining number of games and the new images if there are more games to switch', () => {
            const result = gameManager.switchGame(roomId);
            expect(result.length).toBe(1);
            expect(result.images).toEqual(expectedImages);
        });

        it('should return the remaining number of games and an empty array of images if there are no more games to switch', () => {
            jest.spyOn(gameManager, 'switchData').mockReturnValue(0);
            const result = gameManager.switchGame(roomId);
            expect(result.length).toBe(0);
            expect(result.images).toEqual([]);
        });
    });

    describe('verifyPosition', () => {
        it('should return isDifference true and differenceNumber 1 when clickCoord is on the first difference in the differences array', () => {
            const roomId = 'room1';
            const clickCoord = { x: 1, y: 2 };
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
                name: 'game1',
                images: ['image1.jpg', 'image2.jpg'],
            };
            gameManager.roomIdToGameDifferences.set(roomId, [gameData]);

            const result = gameManager.verifyPosition(roomId, clickCoord);
            expect(result.isDifference).toEqual(true);
            expect(result.differenceNumber).toEqual(1);
            expect(result.coords).toEqual(gameData.differences[0]);
        });

        it('should return isDifference false and differenceNumber 0 when clickCoord is not on any difference in the differences array', () => {
            const roomId = 'room1';
            const clickCoord = { x: 1, y: 2 };
            const gameData = {
                id: 1,
                count: 5,
                differences: [
                    [
                        { x: 3, y: 4 },
                        { x: 5, y: 6 },
                    ],
                ],
                name: 'game1',
                images: ['image1.jpg', 'image2.jpg'],
            };
            gameManager.roomIdToGameDifferences.set(roomId, [gameData]);

            const result = gameManager.verifyPosition(roomId, clickCoord);
            expect(result.isDifference).toEqual(false);
            expect(result.differenceNumber).toEqual(0);
            expect(result.coords).toEqual([]);
        });
    });

    describe('switchData', () => {
        const roomId = 'room1';
        const initialGames: RoomGameData[] = [
            {
                name: 'string',
                count: 3,
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
                images: ['image1.jpg', 'image2.jpg'],
            },
        ];
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const gameManager = new GameManager(new StoreService());
        gameManager.roomIdToGameDifferences.set(roomId, initialGames);

        it('should remove the first game from the current games and return the number of remaining games', () => {
            const result = gameManager.switchData(roomId);

            expect(result).not.toBe(1);
        });

        it('should return 0 if there are no more games', () => {
            const result = gameManager.switchData(roomId);

            expect(result).toBe(0);
            expect(gameManager.roomIdToGameDifferences.get(roomId)).toEqual([]);
        });
    });

    describe('deleteRoomGameInfo', () => {
        it('should remove the game info for the given room', () => {
            const roomId = 'room1';
            gameManager.roomIdToGameDifferences.set(roomId, [{ count: 5, differences: [], name: 'string', images: [] }]);
            gameManager.deleteRoomGameInfo(roomId);
            expect(gameManager.roomIdToGameDifferences.get(roomId)).toBeUndefined();
        });
    });

    describe('getAllDifferences', () => {
        it('should return the count and differences for a given game name', async () => {
            const gameName = 'game1';
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
            jest.spyOn(fs, 'readFile').mockResolvedValueOnce(
                JSON.stringify([
                    {
                        name: gameName,
                        ...gameData,
                    },
                ]),
            );
            const expected: GameDiffData = { id: 0, count: 5, differences: gameData.differences };
            const result = await gameManager.getAllDifferences(gameName);
            expect(result).toEqual(expected);
        });
    });

    it('should return an object with id: 0, count: 0, and an empty differences array when the game is not found', async () => {
        // Arrange
        const gameName = 'nonexistent-game';

        // Act
        const result = await gameManager.getAllDifferences(gameName);

        // Assert
        expect(result).toEqual({ id: 0, count: 0, differences: [] });
    });

    it('should set room games if roomId is valid', async () => {
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

        await gameManager.loadGame(roomId, gameTitles);
        expect(gameManager.roomIdToGameDifferences.get(roomId)).toBeDefined();
    });

    it('should return images of the room if it exists', async () => {
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
        gameManager.getAllRooms = jest.fn().mockReturnValue([roomId]);
        gameManager.roomIdToGameDifferences.set(roomId, [
            {
                name: 'game1',
                count: 5,
                differences: [],
                images: expectedImages,
            },
        ]); // set the game differences for the room

        await gameManager.loadGame(roomId, gameTitles);
        expect(gameManager.switchImages(roomId).images).toEqual(expectedImages);
    });
});
