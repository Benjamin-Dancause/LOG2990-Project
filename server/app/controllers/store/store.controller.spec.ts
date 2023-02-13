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

    it('storeData() should call storeImage() twice', async () => {
        const storeImageSpy = jest.spyOn(storeService, 'storeImage');
        const gameData = { name: 'game1', originalImage: 'image1', modifiableImage: 'image2' };
        await controller.storeData(gameData);
        expect(storeImageSpy).toHaveBeenCalledTimes(2);
    });

    it('storeData() should call storeInfo()', async () => {
        const storeImageSpy = jest.spyOn(storeService, 'storeInfo').mockImplementation();
        const gameData = { name: 'game1', originalImage: 'image1', modifiableImage: 'image2' };

        await controller.storeData(gameData);

        expect(storeImageSpy).toHaveBeenCalled();
    });

    it('getNames() should call getAllNames()', async () => {
        const getAllNamesSpy = jest.spyOn(storeService, 'getAllNames');

        await controller.getNames();

        expect(getAllNamesSpy).toHaveBeenCalled();
    });
});
