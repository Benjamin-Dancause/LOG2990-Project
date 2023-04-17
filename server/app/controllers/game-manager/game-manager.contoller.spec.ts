import { GameManager } from '@app/services/game-manager/game-manager.service';
import { StoreService } from '@app/services/store/store.service';
import { GameDiffData } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { GameManagerController } from './game-manager.controller';

describe('GameManagerController', () => {
    let controller: GameManagerController;
    let gameManager: GameManager;
    let storeService: StoreService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameManagerController],
            providers: [
                {
                    provide: GameManager,
                    useValue: {
                        getAllDifferences: jest.fn(),
                        createGame: jest.fn(),
                    },
                },
                {
                    provide: StoreService,
                    useValue: {
                        getGameDifferenceByName: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<GameManagerController>(GameManagerController);
        gameManager = module.get<GameManager>(GameManager);
        storeService = module.get<StoreService>(StoreService);
    });

    const diffsData = [
        { id: 1, imageId: 1, name: 'diff1' },
        { id: 2, imageId: 1, name: 'diff2' },
        { id: 3, imageId: 2, name: 'diff3' },
        { id: 4, imageId: 2, name: 'diff4' },
    ];

    const gameDiffData: GameDiffData = {
        id: 0,
        count: 0,
        differences: [],
    };

    diffsData.forEach((diff) => {
        if (!gameDiffData[diff.imageId]) {
            gameDiffData[diff.imageId] = [];
        }
        gameDiffData[diff.imageId].push({
            id: diff.id,
            name: diff.name,
        });
    });

    describe('returnAllDiff', () => {
        it('should return all differences', async () => {
            const differences = [
                { id: 1, imageId: 1, name: 'difference1' },
                { id: 2, imageId: 1, name: 'difference2' },
            ];
            const name = 'image1';

            jest.spyOn(gameManager, 'getAllDifferences').mockResolvedValue(gameDiffData);

            const result = await controller.returnAllDiff({ name });

            expect(result).not.toEqual(differences);
            expect(gameManager.getAllDifferences).toHaveBeenCalledWith(name);
        });
    });

    describe('sendDiffAmount', () => {
        it('should create a new game with correct gameDiffData', async () => {
            const name = 'image1';
            const gameDiffData2: GameDiffData = {
                id: 0,
                count: 0,
                differences: [],
            };
            diffsData.forEach((diff) => {
                if (!gameDiffData[diff.imageId]) {
                    gameDiffData[diff.imageId] = [];
                }
                gameDiffData[diff.imageId].push({
                    id: diff.id,
                    name: diff.name,
                });
            });

            jest.spyOn(storeService, 'getGameDifferenceByName').mockResolvedValue(gameDiffData2);

            const result = await controller.sendDiffAmount({ name });

            expect(result).not.toEqual({});
            expect(storeService.getGameDifferenceByName).toHaveBeenCalledWith(name);
        });
    });
});
