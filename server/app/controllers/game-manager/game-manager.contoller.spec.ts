import { GameManager } from '@app/services/game-manager/game-manager.service';
import { StoreService } from '@app/services/store/store.service';
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
                        createGame: jest.fn(),
                        verifyPos: jest.fn(),
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
    describe('checkPos', () => {
        it('should return an DifferenceInterface object', async () => {
            const result = { isDifference: true, differenceNumber: 1, coords: [{ x: 1, y: 1 }] };
            jest.spyOn(gameManager, 'verifyPos').mockResolvedValue(result);

            const body = { name: 'game1', coords: { x: 1, y: 1 } };
            const expected = result;

            expect(await controller.checkPos(body)).toBe(expected);
            expect(gameManager.verifyPos).toHaveBeenCalledWith(body.name, body.coords);
        });
    });

    describe('sendDiffAmount', () => {
        it('should return a number', async () => {
            const result = 5;
            jest.spyOn(gameManager, 'createGame').mockReturnValue(result);
            const body = { name: 'game1' };
            const expected = result;

            expect(await controller.sendDiffAmount(body)).toBe(expected);
            expect(storeService.getGameDifferenceByName).toHaveBeenCalledWith(body.name);
            expect(gameManager.createGame).toHaveBeenCalledWith({ diffAmount: result });
        });
    });
});
