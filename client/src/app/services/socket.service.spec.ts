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
        service.socket = undefined as any;
        service.initializeSocket();
        expect(service.socket).toBeDefined();
    });

    it('should emit "solo-game" when soloGame() is called', () => {
        service.soloGame();
        expect(socketSpy.emit).toHaveBeenCalledWith('solo-game');
    });

    it('should emit "one-vs-one-game" when oneVsOne() is called', () => {
        service.oneVsOne();
        expect(socketSpy.emit).toHaveBeenCalledWith('one-vs-one-game');
    });

    it('should emit "handle-lobby" with player name and gameTitle when handleLobby() is called', () => {
        const name = 'player1';
        const gameTitle = 'game1';
        service.handleLobby(name, gameTitle);
        expect(socketSpy.emit).toHaveBeenCalledWith('handle-lobby', { gameMaster: name, gameTitle: gameTitle });
    });

    it('should emit "start-OneVsOne" when startOneVsOneGame() is called', () => {
        service.startOneVsOneGame();
        expect(socketSpy.emit).toHaveBeenCalledWith('start-OneVsOne');
    });

    it('should emit "reject-player" with player name and gameTitle when rejectPlayer() is called', () => {
        const name = 'player1';
        const gameTitle = 'game1';
        service.rejectPlayer(name, gameTitle);
        expect(socketSpy.emit).toHaveBeenCalledWith('reject-player', { gameMaster: name, gameTitle: gameTitle });
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

    it('should emit "reset-lobby" with gameMaster name and gameTitle when resetLobby() is called', () => {
        const name = 'player1';
        const gameTitle = 'game1';
        service.resetLobby(name, gameTitle);
        expect(socketSpy.emit).toHaveBeenCalledWith('reset-lobby', { gameMaster: name, gameTitle: gameTitle });
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
        service.initOneVsOneComponents(player1);
        expect(socketSpy.emit).toHaveBeenCalledWith('init-OneVsOne-components', player1);
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
        expect(socketSpy.emit).toHaveBeenCalledWith('send-player-message', { name: name, message: message });
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

    it('should disconnect socket when disconnectSocket is called', () => {
        service.disconnectSocket();
        expect(socketSpy.disconnect).toHaveBeenCalled();
    });
});
