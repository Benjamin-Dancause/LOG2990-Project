import { GameManager } from '@app/services/game-manager/game-manager.service';
import { StoreService } from '@app/services/store/store.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameManagerController } from './game-manager.controller';

describe('GameManagerController', () => {
    let gameManagerController: GameManagerController;
    let gameManager: GameManager;
    let storeService: StoreService;

    beforeEach(async () => {
        /*
        gameManager = {
            verifyPos: jest.fn(),
            createGame: jest.fn(),
        };

        storeService = {
            getGameDifferenceByName: jest.fn(),
        };
        */

        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameManagerController],
            providers: [
                { provide: GameManager, useValue: gameManager },
                { provide: StoreService, useValue: storeService },
            ],
        }).compile();

        gameManagerController = module.get<GameManagerController>(GameManagerController);
    });

    describe('checkPos', () => {
        it('should return result from gameManager.verifyPos', async () => {
            const expectedResult = {};

            const result = await gameManagerController.checkPos({
                id: 1,
                coords: { x: 2, y: 3 },
            });

            expect(gameManager.verifyPos).toHaveBeenCalledWith(1, { x: 2, y: 3 });
            expect(result).toBe(expectedResult);
        });
    });

    describe('createNewGame', () => {
        it('should return result from gameManager.createGame', async () => {
            const expectedResult = {};
            const result = await gameManagerController.createNewGame({ name: 'test' });

            expect(storeService.getGameDifferenceByName).toHaveBeenCalledWith('test');
            expect(gameManager.createGame).toHaveBeenCalledWith({});
            expect(result).toBe(expectedResult);
        });
    });
});
