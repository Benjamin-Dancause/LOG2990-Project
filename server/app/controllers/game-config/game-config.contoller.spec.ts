import { Test } from '@nestjs/testing';
import { GameController } from './game-config.controller';

describe('GameController', () => {
    let gameController: GameController;

    beforeEach(async () => {
        const app = await Test.createTestingModule({
            controllers: [GameController],
        }).compile();

        gameController = app.get<GameController>(GameController);
    });

    describe('addPlayer', () => {
        it('should add a player to the good game', () => {
            const userName = 'Test name User';
            const gameTitle = 'Test name Game';

            gameController.addPlayer(gameTitle, userName);
            expect(gameController.getPlayers(gameTitle)).toContain(userName);
        });
    });

    describe('getPlayers', () => {
        it('should return an empty array if no players in game', () => {
            const gameTitle = 'test game';
            expect(gameController.getPlayers(gameTitle)).toEqual([]);
        });

        it('should return an array of players in the specified game', () => {
            const gameTitle = 'Test name Game';
            const userName1 = 'Test name User 1';
            const userName2 = 'Test name User 2';

            gameController.addPlayer(gameTitle, userName1);
            gameController.addPlayer(gameTitle, userName2);

            expect(gameController.getPlayers(gameTitle)).toEqual([userName1, userName2]);
        });
    });

    describe('removePlayer', () => {
        it('should remove a player from the game', () => {
            const gameTitle = 'Test name Game';
            const userName = 'Test name User';

            gameController.addPlayer(gameTitle, userName);
            gameController.removePlayer(gameTitle, userName);
            expect(gameController.getPlayers(gameTitle)).not.toContain(userName);
        });
        it('should remove a player from an empty game', () => {
            const gameTitle = 'emptyGame';
            const userName = 'user1';
            gameController.removePlayer(gameTitle, userName);
            expect(gameController.getPlayers(gameTitle)).toEqual([]);
        });
    });
});
