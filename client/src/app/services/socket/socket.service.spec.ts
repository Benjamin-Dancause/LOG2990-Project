import { TestBed } from '@angular/core/testing';
import { ClickResponse } from '@app/classes/click-response';
import { Socket } from 'socket.io-client';

import { SocketService } from './socket.service';

describe('socketService', () => {
    let service: SocketService;
    let socketSpy: jasmine.SpyObj<Socket>;

    beforeEach(() => {
        socketSpy = jasmine.createSpyObj('Socket', ['emit', 'connect', 'disconnect']);
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketService);
        service.socket = socketSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should Initialize the socket', () => {
        service.initializeSocket();
        expect(service.socket).toBeDefined();
        expect(socketSpy.connect).toHaveBeenCalled();
    });

    it('should create socket if not initialized', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service.socket = undefined as any;
        service.initializeSocket();
        expect(service.socket).toBeDefined();
    });

    it('should emit "one-vs-one-game" when oneVsOne() is called', () => {
        service.oneVsOne();
        expect(socketSpy.emit).toHaveBeenCalledWith('one-vs-one-game');
    });

    it('should emit "handle-lobby" with player name and gameTitle when handleLobby() is called', () => {
        const name = 'player1';
        const gameTitle = 'game1';
        service.handleLobby(name, gameTitle);
        expect(socketSpy.emit).toHaveBeenCalledWith('handle-lobby', { gameMaster: name, gameTitle });
    });

    it('should emit "start-OneVsOne" when startOneVsOneGame() is called', () => {
        service.startOneVsOneGame();
        expect(socketSpy.emit).toHaveBeenCalledWith('start-OneVsOne');
    });

    it('should emit "reject-player" with player name and gameTitle when rejectPlayer() is called', () => {
        const name = 'player1';
        const gameTitle = 'game1';
        service.rejectPlayer(name, gameTitle);
        expect(socketSpy.emit).toHaveBeenCalledWith('reject-player', { gameMaster: name, gameTitle });
    });

    it('should emit "close-lobby" with gameTitle when closeLobby() is called', () => {
        const gameTitle = 'game1';
        service.closeLobby(gameTitle);
        expect(socketSpy.emit).toHaveBeenCalledWith('close-lobby', gameTitle);
    });

    it('should emit "leave-lobby" when leaveLobby() is called', () => {
        service.leaveLobby();
        expect(socketSpy.emit).toHaveBeenCalledWith('leave-lobby');
    });

    it('should emit "delete-game" when deleteGame() is called', () => {
        const gameTitle = 'testGame1';
        service.deleteGame(gameTitle);
        expect(socketSpy.emit).toHaveBeenCalledWith('delete-game', gameTitle);
    });

    it('should emit "reset-lobby" with gameMaster name and gameTitle when resetLobby() is called', () => {
        const name = 'player1';
        const gameTitle = 'game1';
        service.resetLobby(name, gameTitle);
        expect(socketSpy.emit).toHaveBeenCalledWith('reset-lobby', { gameMaster: name, gameTitle });
    });

    it('should emit "get-gameTitle" with roomId when getGameTitle() is called', () => {
        const roomId = '12345';
        service.getGameTitle(roomId);
        expect(socketSpy.emit).toHaveBeenCalledWith('get-gameTitle', roomId);
    });

    it('should emit "get-OneVsOne-info" with gameTitle when assignPlayerInfo() is called', () => {
        const gameTitle = 'game1';
        service.assignPlayerInfo(gameTitle);
        expect(socketSpy.emit).toHaveBeenCalledWith('get-OneVsOne-info', gameTitle);
    });

    it('should emit "init-OneVsOne-components" with player1 boolean when initOneVsOneComponents() is called', () => {
        const player1 = true;
        const player2 = '';
        service.initOneVsOneComponents(player1, player2);
        expect(socketSpy.emit).toHaveBeenCalledWith('init-OneVsOne-components', Object({ player1: true, gameMode: '' }));
    });

    it('should emit "send-difference-found" with ClickResponse when sendDifferenceFound() is called', () => {
        const response: ClickResponse = {
            isDifference: true,
            differenceNumber: 0,
            coords: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
            ],
        };
        service.sendDifferenceFound(response);
        expect(socketSpy.emit).toHaveBeenCalledWith('send-difference-found', response);
    });

    it('should emit "leave-game" when leaveGame() is called', () => {
        service.leaveGame();
        expect(socketSpy.emit).toHaveBeenCalledWith('leave-game');
    });

    it('should emit "send-player-message" with player name and message when sendPlayerMessage() is called', () => {
        const name = 'player1';
        const message = 'testing message';
        service.sendPlayerMessage(name, message);
        expect(socketSpy.emit).toHaveBeenCalledWith('send-player-message', { name, message });
    });

    it('should emit "send-player-error" with player name when sendPlayerError() is called', () => {
        const name = 'player1';
        service.sendPlayerError(name);
        expect(socketSpy.emit).toHaveBeenCalledWith('send-player-error', name);
    });

    it('should emit "send-player-success" with player name when sendPlayerSuccess() is called', () => {
        const name = 'player1';
        service.sendPlayerSuccess(name);
        expect(socketSpy.emit).toHaveBeenCalledWith('send-player-success', name);
    });

    it('should emit "on-victory-sequence" with player1 boolean when sendVictoriousPlayer() is called', () => {
        const player1 = false;
        service.sendVictoriousPlayer(player1);
        expect(socketSpy.emit).toHaveBeenCalledWith('on-victory-sequence', player1);
    });

    it('should emit "reset-timer" when resetTimer() is called', () => {
        const roomId = '12345';
        service.resetTimer(roomId);
        expect(socketSpy.emit).toHaveBeenCalledWith('reset-timer', roomId);
    });

    it('should emit "increment-counter" with player1 boolean when incrementCounter() is called', () => {
        const player1 = false;
        service.incrementCounter(player1);
        expect(socketSpy.emit).toHaveBeenCalledWith('increment-counter', player1);
    });

    it('should emit "reset-counter" with player1 boolean when resetCounter() is called', () => {
        const player1 = false;
        service.resetCounter(player1);
        expect(socketSpy.emit).toHaveBeenCalledWith('reset-counter', player1);
    });

    it('should disconnect socket when disconnectSocket is called', () => {
        service.disconnectSocket();
        expect(socketSpy.disconnect).toHaveBeenCalled();
    });

    it('should emit "solo-game" with the given game mode when soloGame() is called', () => {
        const gameMode = 'easy';
        service.soloGame(gameMode);
        expect(socketSpy.emit).toHaveBeenCalledWith('solo-game', gameMode);
    });

    it('should emit "get-images" when getImages() is called', () => {
        service.getImages();
        expect(socketSpy.emit).toHaveBeenCalledWith('get-images');
    });

    it('should send a new record with the given name, position, title, and mode', () => {
        const name = 'testName';
        const position = 'testPosition';
        const title = 'testTitle';
        const mode = 'testMode';
        service.sendNewRecord(name, position, title, mode);
        expect(socketSpy.emit).toHaveBeenCalledWith('send-new-record', { name, position, title, mode });
    });

    it('should send a player hint with the given name', () => {
        const name = 'testName';
        service.sendPlayerHint(name);
        expect(socketSpy.emit).toHaveBeenCalledWith('send-player-hint', name);
    });

    it('should send the victorious player with the given boolean value for player1', () => {
        const player1 = true;
        service.sendVictoriousPlayer(player1);
        expect(socketSpy.emit).toHaveBeenCalledWith('on-victory-sequence', player1);
    });

    it('should reset the timer with the given roomId', () => {
        const roomId = 'testRoomId';
        service.resetTimer(roomId);
        expect(socketSpy.emit).toHaveBeenCalledWith('reset-timer', roomId);
    });

    it('should increment the counter with the given boolean value for player1', () => {
        const player1 = true;
        service.incrementCounter(player1);
        expect(socketSpy.emit).toHaveBeenCalledWith('increment-counter', player1);
    });

    it('should reset the counter with the given boolean value for player1', () => {
        const player1 = true;
        service.resetCounter(player1);
        expect(socketSpy.emit).toHaveBeenCalledWith('reset-counter', player1);
    });

    it('should initialize the game with the given game titles', () => {
        const gameTitles = ['testGame1', 'testGame2'];
        service.initializeGame(gameTitles);
        expect(socketSpy.emit).toHaveBeenCalledWith('initialize-game', gameTitles);
    });

    it('should send the mouse position with the given coordinates', () => {
        const mousePosition = { x: 10, y: 20 };
        service.sendPosition(mousePosition);
        expect(socketSpy.emit).toHaveBeenCalledWith('verify-position', mousePosition);
    });

    it('should delete room game info', () => {
        service.deleteRoomGameInfo();
        expect(socketSpy.emit).toHaveBeenCalledWith('delete-room-game-info');
    });

    it('should add to the timer', () => {
        service.addToTimer();
        expect(socketSpy.emit).toHaveBeenCalledWith('add-to-timer');
    });

    it('should remove from the timer', () => {
        service.removeToTimer();
        expect(socketSpy.emit).toHaveBeenCalledWith('remove-to-timer');
    });

    it('should emit switch-game when switchGame() is called', () => {
        service.switchGame();
        expect(socketSpy.emit).toHaveBeenCalledWith('switch-game');
    });

    it('should emit "leave-limited-time" when leaveLimitedTime() is called', () => {
        service.leaveLimitedTime();
        expect(socketSpy.emit).toHaveBeenCalledWith('leave-limited-time');
    });
});
