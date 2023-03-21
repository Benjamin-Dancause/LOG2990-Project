// eslint-disable-next-line import/no-unresolved
import { StoreService } from '@app/services/store/store.service';
import { Coords, Data } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { promises as fs } from 'fs';
import * as path from 'path';

describe('StoreService', () => {
    let service: StoreService;
    let deleteMock: jest.Mock;
    let extractDataMock: jest.Mock;
    let tempImagePath: string;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [StoreService],
        }).compile();

        deleteMock = jest.fn();
        extractDataMock = jest.fn();
        service = module.get<StoreService>(StoreService);
        service.deleteGame = deleteMock;
        service.extractData = extractDataMock;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should store game information', async () => {
        const name = 'game1';
        const relativePaths = ['path1', 'path2'];
        const difficulty = true;
        const count = 5;
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
        const gamesData = await service.extractData();
        expect(gamesData.length).toBe(1);
        expect(gamesData[0].name).toBe(name);
        expect(gamesData[0].images).toEqual(relativePaths);
        expect(gamesData[0].difficulty).toBe(difficulty);
        expect(gamesData[0].count).toBe(count);
        expect(gamesData[0].differences).toEqual(differences);
    });
    /*
    it('should store image', async () => {
        const name = 'image1';
        const image = 'data:image/bmp;base64,Qk06AAAAAAAAAAAAA';
        const filePath = `assets/images/${name}.bmp`;
        const result = await service.storeImage(name, image);
        expect(result).toBe(filePath);
    });
    */

    it('should store image', async () => {
        const name = 'image1';
        const image = 'data:image/bmp;base64,Qk06AAAAAAAAAAAAA';
        const filePath = `assets/images/${name}.bmp`;
        const result = await service.storeImage(name, image);
        expect(result).toBe(filePath);
        await fs.unlink(path.join(__dirname, '..', '..', '..', filePath));
    });

    describe('getAllNames', () => {
        it('should return an array of strings', async () => {
            const result = await service.getAllNames();
            expect(result).toBeInstanceOf(Array);
            result.forEach((name) => expect(typeof name).toEqual('string'));
        });

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
        it('should return an array of GameSelectionPageData', async () => {
            const result = await service.getAllGames();
            expect(result).toBeInstanceOf(Array);
            result.forEach((game) =>
                expect(game).toMatchObject({ name: expect.any(String), image: expect.any(String), difficulty: expect.any(Boolean) }),
            );
        });

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

    /*
    it('should delete a game and its associated image files from the storage', async () => {
        const name = 'testGame';
        const gamesData: Data[] = [{ name, images: [], difficulty: true, count: 1, differences: [] }];
        jest.spyOn(service, 'extractData').mockResolvedValue(gamesData);
        jest.spyOn(service, 'deleteFile').mockResolvedValue(undefined);

        await service.deleteGame(name);

        expect(service.deleteFile).toHaveBeenCalledWith(`assets/images/${name}_modif.bmp`);
        expect(service.deleteFile).toHaveBeenCalledWith(`assets/images/${name}_orig.bmp`);
    });
    */

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

    describe('deleteFile', () => {
        it('should call promisify(fs.unlink) with the correct path', async () => {
            const filePath = 'test/file/path.txt';
            await service.deleteFile(filePath);
            expect(deleteMock).toHaveBeenCalledWith(filePath);
        });
    });
});
