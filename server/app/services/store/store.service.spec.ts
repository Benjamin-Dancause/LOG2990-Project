/* eslint-disable max-lines */
import { StoreService } from '@app/services/store/store.service';
import { DIFFERENCE } from '@common/constants';
import { Coords, Data } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { promises as fs } from 'fs';
import * as path from 'path';

describe('StoreService', () => {
    let service: StoreService;
    let service2: StoreService;
    let deleteMock: jest.Mock;
    let extractDataMock: jest.Mock;
    // let tempImagePath: string;
    // let consoleErrorMock: jest.Mock;
    // let readFileMock: jest.Mock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [StoreService],
        }).compile();

        deleteMock = jest.fn();
        extractDataMock = jest.fn();
        // readFileMock = jest.fn();
        service = module.get<StoreService>(StoreService);
        service.extractData = extractDataMock;
        service2 = new StoreService();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('storeInfo', () => {
        it('should add a new game to the gamesData array and write to the gamesData.json file', async () => {
            const spyExtractData = jest.spyOn(service, 'extractData').mockResolvedValue([]);
            const spyWriteFile = jest.spyOn(fs, 'writeFile').mockResolvedValue();

            const name = 'test game';
            const relativePaths = ['path/to/image1', 'path/to/image2'];
            const difficulty = true;
            const count = 10;
            const differences = [
                [
                    { x: 1, y: 2 },
                    { x: 3, y: 4 },
                ],
                [
                    { x: 5, y: 6 },
                    { x: 7, y: 8 },
                ],
            ];

            await service.storeInfo(name, relativePaths, difficulty, count, differences);

            expect(spyExtractData).toHaveBeenCalled();
            expect(spyWriteFile).toHaveBeenCalledWith(
                'assets/data/gamesData.json',
                JSON.stringify([{ name, images: relativePaths, difficulty, count, differences }], null, DIFFERENCE.DIFFCOUNT),
            );
        });

        it('should add a new game to the existing gamesData array and write to the gamesData.json file', async () => {
            const existingGameData: Data = {
                name: 'existing game',
                images: ['path/to/image1'],
                difficulty: false,
                count: 5,
                differences: [[{ x: 1, y: 2 }]],
            };
            const spyExtractData = jest.spyOn(service, 'extractData').mockResolvedValue([existingGameData]);
            const spyWriteFile = jest.spyOn(fs, 'writeFile').mockResolvedValue();

            const name = 'test game';
            const relativePaths = ['path/to/image1', 'path/to/image2'];
            const difficulty = true;
            const count = 10;
            const differences = [
                [
                    { x: 1, y: 2 },
                    { x: 3, y: 4 },
                ],
                [
                    { x: 5, y: 6 },
                    { x: 7, y: 8 },
                ],
            ];

            await service.storeInfo(name, relativePaths, difficulty, count, differences);

            expect(spyExtractData).toHaveBeenCalled();
            expect(spyWriteFile).toHaveBeenCalledWith(
                'assets/data/gamesData.json',
                JSON.stringify([existingGameData, { name, images: relativePaths, difficulty, count, differences }], null, DIFFERENCE.DIFFCOUNT),
            );
        });
    });

    it('should store image', async () => {
        const name = 'image1';
        const image = 'data:image/bmp;base64,Qk06AAAAAAAAAAAAA';
        const filePath = `assets/images/${name}.bmp`;
        const result = await service.storeImage(name, image);
        expect(result).toBe(filePath);
        await fs.unlink(path.join(__dirname, '..', '..', '..', filePath));
    });

    describe('getAllNames', () => {
        it('should return all game names', async () => {
            const gamesData = [
                { name: 'game1', images: ['image1'], difficulty: true, count: 5, differences: [[]] },
                { name: 'game2', images: ['image2'], difficulty: false, count: 3, differences: [[]] },
                { name: 'game3', images: ['image3'], difficulty: true, count: 2, differences: [[]] },
            ];
            jest.spyOn(service, 'extractData').mockResolvedValueOnce(gamesData);
            const result = await service.getAllNames();
            expect(result).toEqual(['game1', 'game2', 'game3']);
        });
    });

    describe('getAllGames', () => {
        it('should return all games with their first image', async () => {
            const gamesData = [
                { name: 'game1', images: ['image1', 'image1_modif.bmp', 'image1_orig.bmp'], difficulty: true, count: 5, differences: [[]] },
                { name: 'game2', images: ['image2', 'image2_modif.bmp', 'image2_orig.bmp'], difficulty: false, count: 3, differences: [[]] },
                { name: 'game3', images: ['image3', 'image3_modif.bmp', 'image3_orig.bmp'], difficulty: true, count: 2, differences: [[]] },
            ];
            jest.spyOn(service, 'extractData').mockResolvedValueOnce(gamesData);
            const result = await service.getAllGames();
            expect(result).toEqual([
                { name: 'game1', image: 'image1', difficulty: true },
                { name: 'game2', image: 'image2', difficulty: false },
                { name: 'game3', image: 'image3', difficulty: true },
            ]);
        });
    });

    describe('getGameByName', () => {
        it('should return a GameplayData object', async () => {
            const gamesData = [{ name: 'game1', images: ['image1'], difficulty: true, count: 5, differences: [[]] }];
            jest.spyOn(service, 'extractData').mockResolvedValueOnce(gamesData);
            const result = await service.getGameByName({ name: 'game1' });
            expect(result).toMatchObject({
                name: expect.any(String),
                images: expect.any(Array),
                difficulty: expect.any(Boolean),
                count: expect.any(Number),
            });
        });

        it('should return the gameplay data of the specified game', async () => {
            const gamesData = [
                { name: 'game1', images: ['image1'], difficulty: true, count: 5, differences: [[]] },
                { name: 'game2', images: ['image2'], difficulty: false, count: 10, differences: [[]] },
            ];
            jest.spyOn(service, 'extractData').mockResolvedValueOnce(gamesData);
            const result = await service.getGameByName({ name: 'game2' });
            expect(result).toMatchObject({ name: 'game2', images: ['image2'], difficulty: false, count: 10 });
        });
    });

    it('should return GameDiffData for an existing game', async () => {
        const name = 'testGame';
        const differences: Coords[][] = [
            [
                { x: 1, y: 1 },
                { x: 2, y: 2 },
            ],
        ];
        const gamesData: Data[] = [{ name, images: [], difficulty: true, count: 1, differences }];
        jest.spyOn(service, 'extractData').mockResolvedValue(gamesData);

        const result = await service.getGameDifferenceByName(name);

        expect(result).toEqual({ id: 0, count: 1, differences });
    });

    it('should return undefined for a non-existent game', async () => {
        const name = 'nonExistentGame';
        const gamesData: Data[] = [];
        jest.spyOn(service, 'extractData').mockResolvedValue(gamesData);

        const result = await service.getGameDifferenceByName(name);

        expect(result).toBeUndefined();
    });

    it('should return undefined for a non-existent game name', async () => {
        const name = 'nonExistentGame';
        const gamesData: Data[] = [];
        jest.spyOn(service, 'extractData').mockResolvedValue(gamesData);

        const result = await service.getGameByName({ name });

        expect(result).toBeUndefined();
    });

    describe('deleteGame()', () => {
        beforeEach(() => {
            jest.spyOn(service, 'extractData').mockResolvedValueOnce([
                { name: 'game1', images: ['img1.bmp'], difficulty: true, count: 10, differences: [] },
                { name: 'game2', images: ['img2.bmp'], difficulty: false, count: 5, differences: [] },
            ]);
            jest.spyOn(service, 'deleteFile');
            jest.spyOn(fs, 'writeFile').mockResolvedValueOnce(undefined);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should delete the game with the given name and write to the gamesData.json file', async () => {
            await service.deleteGame('game1');
            expect(service.extractData).toHaveBeenCalled();
            expect(service.deleteFile).toHaveBeenCalledTimes(2);
            expect(service.deleteFile).toHaveBeenCalledWith('assets/images/game1_modif.bmp');
            expect(service.deleteFile).toHaveBeenCalledWith('assets/images/game1_orig.bmp');
            expect(fs.writeFile).toHaveBeenCalledWith(
                'assets/data/gamesData.json',
                JSON.stringify([{ name: 'game2', images: ['img2.bmp'], difficulty: false, count: 5, differences: [] }], null, DIFFERENCE.DIFFCOUNT),
            );
        });
    });

    describe('deleteAllGames()', () => {
        beforeEach(() => {
            jest.spyOn(service, 'extractData').mockResolvedValueOnce([
                { name: 'game1', images: ['img1.bmp'], difficulty: true, count: 10, differences: [] },
                { name: 'game2', images: ['img2.bmp'], difficulty: false, count: 5, differences: [] },
            ]);
            jest.spyOn(service, 'deleteFile');
            jest.spyOn(fs, 'writeFile').mockResolvedValueOnce(undefined);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should delete all games and write to the gamesData.json file', async () => {
            await service.deleteAllGames();
            expect(service.extractData).toHaveBeenCalled();
            expect(service.deleteFile).toHaveBeenCalledTimes(DIFFERENCE.DIFFCOUNT);
            expect(service.deleteFile).toHaveBeenCalledWith('assets/images/game1_modif.bmp');
            expect(service.deleteFile).toHaveBeenCalledWith('assets/images/game1_orig.bmp');
            expect(service.deleteFile).toHaveBeenCalledWith('assets/images/game2_modif.bmp');
            expect(service.deleteFile).toHaveBeenCalledWith('assets/images/game2_orig.bmp');
            expect(fs.writeFile).toHaveBeenCalledWith('assets/data/gamesData.json', JSON.stringify([], null, DIFFERENCE.DIFFCOUNT));
        });
    });

    it('should not delete anything for a non-existent game', async () => {
        const name = 'nonExistentGame';
        const gamesData: Data[] = [];
        jest.spyOn(service, 'extractData').mockResolvedValue(gamesData);
        jest.spyOn(service, 'deleteFile').mockResolvedValue(undefined);

        await service.deleteGame(name);

        expect(service.deleteFile).not.toHaveBeenCalled();
    });

    it('should return true for an existing game', async () => {
        const name = 'testGame';
        const gamesData: Data[] = [{ name, images: [], difficulty: true, count: 1, differences: [] }];
        jest.spyOn(service, 'extractData').mockResolvedValue(gamesData);

        const result = await service.getGameAvailability(name);

        expect(result).toBe(true);
    });

    it('should return false for a non-existent game', async () => {
        const name = 'nonExistentGame';
        const gamesData: Data[] = [];
        jest.spyOn(service, 'extractData').mockResolvedValue(gamesData);

        const result = await service.getGameAvailability(name);

        expect(result).toBe(false);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('extractData', () => {
        it('should extract games data from the JSON file', async () => {
            const gamesData: Data[] = [
                { name: 'game1', images: [], difficulty: true, count: 1, differences: [] },
                { name: 'game2', images: [], difficulty: false, count: 1, differences: [] },
            ];
            const expectedContent = JSON.stringify(gamesData, null, DIFFERENCE.DIFFCOUNT);
            jest.spyOn(fs, 'readFile').mockResolvedValue(expectedContent);

            const result = await service2.extractData();

            expect(fs.readFile).toHaveBeenCalledWith('assets/data/gamesData.json', 'utf-8');
            expect(result).toEqual(gamesData);
        });
    });
});
