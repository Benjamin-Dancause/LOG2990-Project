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
        const infoPath = `assets/data/gamesData.json`;
        const gameInfo = { name: name, images: relPaths, difficulty: difficulty, count: count, differences: differences };

        jest.spyOn(fs, 'readFile').mockImplementationOnce(() => Promise.resolve(`[]`));
        jest.spyOn(fs, 'writeFile').mockImplementation(() => Promise.resolve());

        await service.storeInfo(name, relPaths, difficulty, count, differences);

        expect(fs.writeFile).toHaveBeenCalledWith(infoPath, JSON.stringify([gameInfo], null, 4));
    });

    it('storeImage() should store image and return the correct path', async () => {
        const name = 'testGame';
        const image = 'data:image/png;base64,Qk02CAAAAAAAADYAAAAoAAAAEAAAABAAAAABAAAAAAAAAAAAAAAAAAAAA';
        jest.spyOn(fs, 'writeFile').mockImplementationOnce(() => Promise.resolve());
        jest.spyOn(Buffer, 'from').mockImplementation();

        const filePath = await service.storeImage(name, image);
        const fileIsStored = await fs
            .stat(filePath)
            .then(() => true)
            .catch(() => false);
        expect(filePath).toBe(`assets/images/${name}.bmp`);
        // expect(fileIsStored).toBe(true);
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

        jest.spyOn(fs, 'readFile').mockImplementationOnce(() => Promise.resolve(JSON.stringify(gameData)));
        const nameArray = await service.getAllNames();
        expect(nameArray).toEqual(['game1', 'game2', 'game3']);
    });
});
