import { databaseService } from '@app/services/database/database.service';
import { StoreService } from '@app/services/store/store.service';
import { GameSelectionPageData } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { StoreController } from './store.controller';

describe('StoreController', () => {
    let controller: StoreController;
    let storeService: StoreService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StoreController],
            providers: [
                {
                    provide: StoreService,
                    useValue: {
                        storeImage: jest.fn(),
                        storeInfo: jest.fn(),
                        getAllNames: jest.fn(),
                        getAllGames: jest.fn(),
                        getGameByName: jest.fn(),
                        deleteGame: jest.fn(),
                        getGameAvailability: jest.fn(),
                    },
                },
                {
                    provide: databaseService,
                    useValue: {
                        deleteBestTimes: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<StoreController>(StoreController);
        storeService = module.get<StoreService>(StoreService);
    });
    it('should store data', async () => {
        const data = {
            name: 'test-game',
            originalImage: 'original-image-data',
            modifiableImage: 'modifiable-image-data',
            difficulty: true,
            count: 5,
            differences: [[{ x: 1, y: 2 }], [{ x: 3, y: 4 }]],
        };

        jest.spyOn(storeService, 'storeImage').mockResolvedValue('relative-path');
        jest.spyOn(storeService, 'storeInfo').mockResolvedValue();

        await controller.storeData(data);

        expect(storeService.storeImage).toHaveBeenCalledTimes(2);
        expect(storeService.storeImage).toHaveBeenCalledWith('test-game_orig', 'original-image-data');
        expect(storeService.storeImage).toHaveBeenCalledWith('test-game_modif', 'modifiable-image-data');
        expect(storeService.storeInfo).toHaveBeenCalledWith('test-game', ['relative-path', 'relative-path'], true, 5, [
            [{ x: 1, y: 2 }],
            [{ x: 3, y: 4 }],
        ]);
    });

    it('should get all game names', async () => {
        const names = ['game1', 'game2'];

        jest.spyOn(storeService, 'getAllNames').mockResolvedValue(names);

        const result = await controller.getNames();

        expect(result).toEqual(names);
        expect(storeService.getAllNames).toHaveBeenCalled();
    });
    it('should get all game information', async () => {
        const gameList: GameSelectionPageData[] = [
            { name: 'game1', image: 'image1', difficulty: true },
            { name: 'game2', image: 'image2', difficulty: true },
        ];

        const games = [{ name: 'game1' }, { name: 'game2' }];

        jest.spyOn(storeService, 'getAllGames').mockResolvedValue(gameList);
        const result = await controller.getGameList();
        expect(result).not.toEqual(games);
        expect(storeService.getAllGames).toHaveBeenCalled();
    });

    it('should get game information by name', async () => {
        const gameName = 'test-game';
        const games = [{ name: 'game1' }, { name: 'game2' }];
        const result = await controller.getGameByName({ name: gameName });
        expect(result).not.toEqual(games);
        expect(storeService.getGameByName).toHaveBeenCalled();
    });

    it('should check game availability', async () => {
        const gameName = 'test-game';
        jest.spyOn(storeService, 'getGameAvailability').mockResolvedValue(true);
        const result = await controller.getGameAvailability(gameName);
        expect(result).toEqual(true);
        expect(storeService.getGameAvailability).toHaveBeenCalledWith(gameName);
    });

    it('should delete the game and its best times from the database and the store', async () => {
        const gameName = 'test-game';
        jest.spyOn(storeService, 'deleteGame').mockResolvedValue();
        await expect(controller.deleteGame(gameName)).resolves.toBeUndefined();
        expect(storeService.deleteGame).toHaveBeenCalledWith(gameName);
    });
});
