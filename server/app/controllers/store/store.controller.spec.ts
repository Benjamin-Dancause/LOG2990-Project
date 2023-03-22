import { StoreController } from '@app/controllers/store/store.controller';
import { StoreService } from '@app/services/store/store.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

describe('StoreController', () => {
    let controller: StoreController;
    let storeService: SinonStubbedInstance<StoreService>;

    beforeEach(async () => {
        storeService = createStubInstance(StoreService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StoreController],
            providers: [
                {
                    provide: StoreService,
                    useValue: storeService,
                },
            ],
        }).compile();

        controller = module.get<StoreController>(StoreController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('storeData() should call storeService.storeImage() twice', async () => {
        const storeImageSpy = jest.spyOn(storeService, 'storeImage');
        const gameData = {
            name: 'game1',
            originalImage: 'image1',
            modifiableImage: 'image2',
            difficulty: true,
            count: 6,
            differences: [
                [
                    { x: 1, y: 1 },
                    { x: 2, y: 2 },
                ],
            ],
        };

        await controller.storeData(gameData);
        expect(storeImageSpy).toHaveBeenCalledTimes(2);
    });

    it('storeData() should call storeService.storeInfo()', async () => {
        const storeImageSpy = jest.spyOn(storeService, 'storeInfo').mockImplementation();
        const gameData = {
            name: 'game1',
            originalImage: 'image1',
            modifiableImage: 'image2',
            difficulty: true,
            count: 6,
            differences: [
                [
                    { x: 1, y: 1 },
                    { x: 2, y: 2 },
                ],
            ],
        };
        await controller.storeData(gameData);

        expect(storeImageSpy).toHaveBeenCalled();
    });

    it('getNames() should call storeService.getAllNames()', async () => {
        const getAllNamesSpy = jest.spyOn(storeService, 'getAllNames');

        await controller.getNames();

        expect(getAllNamesSpy).toHaveBeenCalled();
    });

    it('getGameList() should call storeService.getAllGames()', async () => {
        const getAllNamesSpy = jest.spyOn(storeService, 'getAllGames');

        await controller.getGameList();

        expect(getAllNamesSpy).toHaveBeenCalled();
    });

    it('getGameByName should call storeService.getGameByName()', async () => {
        const body = { name: 'testGame' };
        jest.spyOn(storeService, 'getGameByName').mockImplementation();

        await controller.getGameByName(body);
        expect(storeService.getGameByName).toHaveBeenCalledWith(body);
    });

    it('deleteGame should call storeService.deleteGame()', async () => {
        const body = 'testGame';
        jest.spyOn(storeService, 'deleteGame').mockImplementation();

        await controller.deleteGame(body);
        expect(storeService.deleteGame).toHaveBeenCalledWith(body);
    });

    it('getGameAvailability should call storeService.getGameAvailability()', async () => {
        const body = 'testGame';
        jest.spyOn(storeService, 'getGameAvailability').mockImplementation();

        await controller.getGameAvailability(body);
        expect(storeService.getGameAvailability).toHaveBeenCalledWith(body);
    });
});
