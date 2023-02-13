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
        const relPaths = ['assetsimages\test1_orig.bmp', '/assets/images/test1_modif.bmp'];
        const infoPath = `assets/data/gamesData.json`;
        const gameInfo = { name: name, images: relPaths };
        await service.storeInfo(name, relPaths);

        const gamesContent = await fs.readFile(infoPath, 'utf8');
        const gamesData = JSON.parse(gamesContent);
        expect(gamesData).toContainEqual(gameInfo);
    });
});
