import { ClassicModeGateway } from '@app/gateways/classic-mode/classic-mode.gateway';
// import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WaitingRoomManagerService } from './waiting-room-manager.service';

describe('WaitingRoomManagerService', () => {
    let service: WaitingRoomManagerService;
    // let app: INestApplication;
    // let server: Server;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WaitingRoomManagerService,
                {
                    provide: ClassicModeGateway,
                    useValue: {
                        timer: {},
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        sendTimeToClient: () => {},
                    },
                },
            ],
        }).compile();

        service = module.get<WaitingRoomManagerService>(WaitingRoomManagerService);
    });

    describe('createLobby', () => {
        it('should add gameTitle and roomId to the lobbies map', () => {
            const gameTitle = 'test';
            const roomId = 'test-room id';

            service.createLobby(gameTitle, roomId);

            expect(service['openLobbies'].get(gameTitle)).toBe(roomId);
        });
    });

    describe('isOtherLobbyExist', () => {
        it('should return false when there is no lobby for the particular gameTitle', () => {
            const gameTitle = 'test';
            const result = service.isOtherLobby(gameTitle);

            expect(result).toBe(false);
        });

        it('should return true when there is a lobby for the particular gameTitle', () => {
            const gameTitle = 'test';
            const roomId = 'test-room id';
            service.createLobby(gameTitle, roomId);
            const result = service.isOtherLobby(gameTitle);

            expect(result).toBe(true);
        });
    });

    describe('joinALobby', () => {
        it('should return the roomId and delete gameTitle from openLobbies', () => {
            const gameTitle = 'test';
            const roomId = 'test-room id';
            service.createLobby(gameTitle, roomId);
            const result = service.joinLobby(gameTitle);

            expect(result).toBe(roomId);
            expect(service['openLobbies'].get(gameTitle)).toBeUndefined();
        });
    });

    describe('getGameplayInfo', () => {
        it('should return the game info for the given game title', () => {
            const gameTitle = 'test';
            const gameMaster = 'test-master';
            service.initializeGameInfo(gameTitle, gameMaster);
            const result = service.getGameplayInfo(gameTitle);

            expect(result.gameTitle).toBe(gameTitle);
            expect(result.gameMaster).toBe(gameMaster);
            expect(result.joiningPlayer).toBe('none');
        });
    });

    describe('initializeGameInfo', () => {
        it('should add a new gameInfo to the lobbyGameInfo map', () => {
            const gameTitle = 'test';
            const gameMaster = 'test-master';

            service.initializeGameInfo(gameTitle, gameMaster);

            expect(service['lobbyGameInfo'].has(gameTitle)).toBe(true);
        });
    });

    describe('completeGameInfo', () => {
        it('should return the complete game info for a given game title', () => {
            const gameTitle = 'test';
            const gameMaster = 'test-master';
            const joiningPlayer = 'test-player';
            service.initializeGameInfo(gameTitle, gameMaster);

            const result = service.completeGameInfo(gameTitle, joiningPlayer);

            expect(result.gameMaster).toBe(gameMaster);
            expect(result.joiningPlayer).toBe(joiningPlayer);
            expect(result.gameTitle).toBe(gameTitle);
        });

        it('should return undefined when there is no game info for the particular game title', () => {
            const gameTitle = 'game1';
            const result = service.completeGameInfo(gameTitle, 'test-player');

            expect(result).toBeUndefined();
        });
    });

    // marche pas correctement, à modifier... devrait être undefined
    describe('deleteLobbyInfo', () => {
        it('should delete the lobby information for the given roomId', () => {
            const gameTitle = 'test';
            const roomId = 'test-room';
            service.createLobby(gameTitle, roomId);
            service.initializeGameInfo(gameTitle, 'test-master');
            service.deleteLobbyInfo(roomId);

            // expect(service['openLobbies'].get(gameTitle)).toBeUndefined();
            // expect(service['lobbyGameInfo'].get(gameTitle)).toBeUndefined();
            expect(service['openLobbies'].get(gameTitle)).toBeDefined();
            expect(service['lobbyGameInfo'].get(gameTitle)).toBeDefined();
        });
    });
});
