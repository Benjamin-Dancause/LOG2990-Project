import { DateService } from '@app/services/date/date.service';
import { StoreService } from '@app/services/store/store.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { promises as fs } from 'fs';

describe('StoreService', () => {
    let service: StoreService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [StoreService, DateService, Logger],
        }).compile();

        service = module.get<StoreService>(StoreService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('storeInfo() should store game information', async () => {
        const name = 'testGame';
        const relPaths = ['assets/images/test1_orig.bmp', '/assets/images/test1_modif.bmp'];
        const difficulty = true;
        const count = 5;
        const differences = [
            [
                { x: 1, y: 1 },
                { x: 2, y: 2 },
            ],
        ];
        const infoPath = 'assets/data/gamesData.json';
        const gameInfo = { name, images: relPaths, difficulty, count, differences };

        jest.spyOn(fs, 'readFile').mockImplementationOnce(async () => Promise.resolve('[]'));
        jest.spyOn(fs, 'writeFile').mockImplementation(async () => Promise.resolve());

        await service.storeInfo(name, relPaths, difficulty, count, differences);

        expect(fs.writeFile).toHaveBeenCalledWith(infoPath, JSON.stringify([gameInfo], null, 4));
    });

    it('storeImage() should store image and return the correct path', async () => {
        const name = 'testGame';
        const image = 'data:image/bmp;base64,Qk12BAAAAAAAAAD4AAAAoAAAAAQAAAAEAAAABACAAAAAAAAYAAAASCwAAEgsAAAAAAAAAAAAA/30=';
        const writeFileMock = jest.spyOn(fs, 'writeFile').mockImplementation(() => {
            return Promise.resolve();
        });
        const filePath = await service.storeImage(name, image);
        expect(filePath).toBe(`assets/images/${name}.bmp`);
        expect(writeFileMock).toBeCalled();
    });

    it('getAllNames() should return all game names', async () => {
        const gameData = [
            {
                name: 'game1',
                images: ['image1', 'image2'],
                difficulty: true,
                count: 6,
                differences: [
                    [
                        { x: 1, y: 1 },
                        { x: 2, y: 2 },
                    ],
                ],
            },
            {
                name: 'game2',
                images: ['image1', 'image2'],
                difficulty: true,
                count: 6,
                differences: [
                    [
                        { x: 1, y: 1 },
                        { x: 2, y: 2 },
                    ],
                ],
            },
            {
                name: 'game3',
                images: ['image1', 'image2'],
                difficulty: true,
                count: 6,
                differences: [
                    [
                        { x: 1, y: 1 },
                        { x: 2, y: 2 },
                    ],
                ],
            },
        ];

        jest.spyOn(fs, 'readFile').mockImplementationOnce(async () => Promise.resolve(JSON.stringify(gameData)));
        const nameArray = await service.getAllNames();
        expect(nameArray).toEqual(['game1', 'game2', 'game3']);
    });

    it('getAllGames() should return an array of games with name, main image and difficulty', async () => {
        const gamesData = [
            {
                name: 'test1',
                images: ['image1', 'image2'],
                difficulty: true,
                count: 5,
                differences: [
                    { x: 1, y: 1 },
                    { x: 1, y: 1 },
                ],
            },
            {
                name: 'test2',
                images: ['image1', 'image2'],
                difficulty: false,
                count: 6,
                differences: [
                    { x: 2, y: 2 },
                    { x: 2, y: 2 },
                ],
            },
            {
                name: 'test3',
                images: ['image1', 'image2'],
                difficulty: true,
                count: 7,
                differences: [
                    { x: 3, y: 3 },
                    { x: 3, y: 3 },
                ],
            },
        ];
        jest.spyOn(fs, 'readFile').mockImplementationOnce(async () => Promise.resolve(JSON.stringify(gamesData)));
        const game = await service.getAllGames();
        const expectedGame = [
            { name: 'test1', image: 'image1', difficulty: true },
            { name: 'test2', image: 'image1', difficulty: false },
            { name: 'test3', image: 'image1', difficulty: true },
        ];
        expect(game).toEqual(expectedGame);
    });

    it('getGameByName() should return a name, two images, difficulty boolean and difference count if given correct name', async () => {
        const gamesData = [
            {
                name: 'test1',
                images: ['image1', 'image2'],
                difficulty: true,
                count: 5,
                differences: [
                    { x: 1, y: 1 },
                    { x: 1, y: 1 },
                ],
            },
            {
                name: 'test2',
                images: ['image1', 'image2'],
                difficulty: false,
                count: 6,
                differences: [
                    { x: 2, y: 2 },
                    { x: 2, y: 2 },
                ],
            },
        ];
        jest.spyOn(fs, 'readFile').mockImplementationOnce(async () => Promise.resolve(JSON.stringify(gamesData)));
        const game = await service.getGameByName({ name: 'test2' });
        const expectedGame = { name: 'test2', images: ['image1', 'image2'], difficulty: false, count: 6 };
        expect(game).toEqual(expectedGame);
    });

    it('getGameByName() should return undefined if given incorrect name', async () => {
        const gamesData = [
            {
                name: 'test1',
                images: ['image1', 'image2'],
                difficulty: true,
                count: 5,
                differences: [
                    { x: 1, y: 1 },
                    { x: 1, y: 1 },
                ],
            },
            {
                name: 'test2',
                images: ['image1', 'image2'],
                difficulty: false,
                count: 6,
                differences: [
                    { x: 2, y: 2 },
                    { x: 2, y: 2 },
                ],
            },
        ];
        jest.spyOn(fs, 'readFile').mockImplementationOnce(async () => Promise.resolve(JSON.stringify(gamesData)));
        const game = await service.getGameByName({ name: 'test3' });
        expect(game).toBe(undefined);
    });

    it('getGameDifferenceByName() should return an id of 0, the difference count and the difference array if given a correct name', async () => {
        const gamesData = [
            {
                name: 'test1',
                images: ['image1', 'image2'],
                difficulty: true,
                count: 5,
                differences: [
                    { x: 1, y: 1 },
                    { x: 1, y: 1 },
                ],
            },
            {
                name: 'test2',
                images: ['image1', 'image2'],
                difficulty: false,
                count: 6,
                differences: [
                    { x: 2, y: 2 },
                    { x: 2, y: 2 },
                ],
            },
        ];
        jest.spyOn(fs, 'readFile').mockImplementationOnce(async () => Promise.resolve(JSON.stringify(gamesData)));
        const game = await service.getGameDifferenceByName('test2');
        const expectedGame = {
            id: 0,
            count: 6,
            differences: [
                { x: 2, y: 2 },
                { x: 2, y: 2 },
            ],
        };
        expect(game).toEqual(expectedGame);
    });

    it('getGameByName() should return undefined if given incorrect name', async () => {
        const gamesData = [
            {
                name: 'test1',
                images: ['image1', 'image2'],
                difficulty: true,
                count: 5,
                differences: [
                    { x: 1, y: 1 },
                    { x: 1, y: 1 },
                ],
            },
            {
                name: 'test2',
                images: ['image1', 'image2'],
                difficulty: false,
                count: 6,
                differences: [
                    { x: 2, y: 2 },
                    { x: 2, y: 2 },
                ],
            },
        ];
        jest.spyOn(fs, 'readFile').mockImplementationOnce(async () => Promise.resolve(JSON.stringify(gamesData)));
        const game = await service.getGameDifferenceByName('test6');
        expect(game).toBe(undefined);
    });
});
