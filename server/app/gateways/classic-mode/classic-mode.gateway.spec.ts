import { ClickResponse } from '@app/classes/click-response';
import { CounterManagerService } from '@app/services/counter-manager/counter-manager.service';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { StoreService } from '@app/services/store/store.service';
import { TimerManagerService } from '@app/services/timer-manager/timer-manager.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager/waiting-room-manager.service';
import { CompleteGameInfo, Coords, DifferenceInterface, GameInfo, Lobby, OneVsOneGameplayInfo } from '@common/game-interfaces';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { PRIVATE_ROOM_ID } from '../chat/chat.gateway.constants';
import { ClassicModeGateway } from './classic-mode.gateway';

interface PlayerSockets {
    masterSocket: Socket;
    joiningSocket?: Socket;
}

describe('ClassicModeGateway', () => {
    let gateway: ClassicModeGateway;
    let service: CounterManagerService;
    let timer: TimerManagerService;
    let counter: CounterManagerService;
    let game: GameManager;
    let store: StoreService;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let waiting: WaitingRoomManagerService;
    const sinon = require('sinon');
    const socketio = require('socket.io');
    const io = socketio(server);

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        timer = createStubInstance<TimerManagerService>(TimerManagerService);
        timer.resetTimer = jest.fn();
        timer.startTimer = jest.fn();
        timer.deleteTimerData = jest.fn();
        counter = createStubInstance<CounterManagerService>(CounterManagerService);
        counter.startCounter = jest.fn();
        counter.resetCounter = jest.fn().mockReturnValue(0);
        counter.incrementCounter = jest.fn().mockReturnValue(1);
        game = createStubInstance<GameManager>(GameManager);
        game.createGame = jest.fn();
        game.loadGame = await jest.fn();
        store = createStubInstance<StoreService>(StoreService);
        waiting = createStubInstance<WaitingRoomManagerService>(WaitingRoomManagerService);
        waiting.getGameplayInfo = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClassicModeGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: TimerManagerService,
                    useValue: timer,
                },
                { provide: CounterManagerService, useValue: counter },
                WaitingRoomManagerService,
                { provide: GameManager, useValue: game },
                { provide: StoreService, useValue: store },
                { provide: WaitingRoomManagerService, useValue: waiting },
            ],
        }).compile();

        service = new CounterManagerService();
        waiting = module.get<WaitingRoomManagerService>(WaitingRoomManagerService);
        gateway = module.get<ClassicModeGateway>(ClassicModeGateway);
        gateway['server'] = server;
        timer = module.get<TimerManagerService>(TimerManagerService);
        waiting = module.get<WaitingRoomManagerService>(WaitingRoomManagerService);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
    it('should reset the counter for a given roomId', () => {
        const roomId = 'test-room';
        counter.incrementCounter(roomId);
        expect(service.getCounterFromRoom(roomId)).toEqual(0);
        service.resetCounter(roomId);
        expect(service.getCounterFromRoom(roomId)).toEqual(0);
    });

    it('should increment the counter for a given roomId', () => {
        const roomId = 'test-room';
        const counter = service.incrementCounter(roomId);
        expect(counter).toBe(NaN);
    });

    it('should emit time to room', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
        const timer = 'timer';
        const time = 10;
        server.to.returns({
            emit: (eventStr: string, eventNum) => {
                expect(eventStr).toEqual(timer);
                expect(eventNum).toEqual(time);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.emitTimeToRoom(timer, time);
    });

    it('onReset should reset the timer and disconnect the client', () => {
        const roomId = 'testRoom';
        gateway.onReset(socket, roomId);

        expect(timer.resetTimer).toHaveBeenCalledWith(roomId);
        expect(socket.disconnect.called).toBe(true);
    });
    it('should redirect to game when starting a 1 on 1 game', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
        const action = 'redirectToGame';
        const page = '/gameOneVsOne';
        server.to.returns({
            emit: (command: string, redirect: string) => {
                expect(command).toEqual(action);
                expect(redirect).toEqual(page);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onStartOneVsOne(socket);
    });
    it('should start a solo game', () => {
        gateway.onSoloGame(socket, '');
        expect(socket.join.calledOnce).toBeTruthy();
        expect(timer.startTimer).toHaveBeenCalled();
        expect(counter.startCounter).toHaveBeenCalled();
    });
    it('should leave the game', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
        const action = 'player-quit-game';
        server.to.returns({
            emit: (command: string) => {
                expect(command).toEqual(action);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onLeaveGame(socket);
    });
    it('should send-victorious-player when handleVictorySequence is called', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
        const player1 = true;
        const victory = 'send-victorious-player';
        server.to.returns({
            emit: (eventStr: string, eventBool) => {
                expect(eventStr).toEqual(victory);
                expect(eventBool).toEqual(player1);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.handleVictorySequence(socket, player1);
    });
    it('should send player message on send-player-message', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
        const action = 'incoming-player-message';
        const messageInfo = { name: 'player1', message: 'hello' };
        server.to.returns({
            emit: (command: string, eventMessage) => {
                expect(command).toEqual(action);
                expect(eventMessage).toEqual(messageInfo);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onSendPlayerMessage(socket, messageInfo);
    });
    it('should send player message on send-player-error', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
        const action = 'player-error';
        const name = 'player1';
        server.to.returns({
            emit: (command: string, eventMessage) => {
                expect(command).toEqual(action);
                expect(eventMessage).toEqual(name);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onSendPlayerError(socket, name);
    });
    it('should send player message on send-player-success', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
        const action = 'player-success';
        const name = 'player1';
        server.to.returns({
            emit: (command: string, eventMessage) => {
                expect(command).toEqual(action);
                expect(eventMessage).toEqual(name);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onSendPlayerError(socket, name);
    });
    it('should send player left on leave-lobby and make socket leave room', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
        const action = 'player-left';
        server.to.returns({
            emit: (command: string) => {
                expect(command).toEqual(action);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onLeaveLobby(socket);
        expect(socket.leave.calledOnce).toBe(true);
    });
    it('should start timer and counter on "init-OneVsOne-components', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const player1 = true;
        const gameMode = '';
        gateway.onInitOneVsOneComponents(socket, { player1, gameMode });
        expect(counter.startCounter).toBeCalledWith('1234_player1');
        expect(timer.startTimer).toBeCalledWith('1234', gameMode);

        const player2 = false;

        gateway.onInitOneVsOneComponents(socket, { player1: player2, gameMode });
        expect(counter.startCounter).toBeCalledWith('1234_player2');
    });
    it('should start timer and counter on "init-OneVsOne-components" when game mode is "tl"', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const player1 = true;
        const gameMode = 'tl';
        gateway.onInitOneVsOneComponents(socket, { player1, gameMode });
        expect(counter.startCounter).toBeCalledWith('1234_player1');
        expect(timer.startTimer).toBeCalledWith('1234', gameMode);
    });
    it('should reset the counter for player 1', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const player1 = true;
        const action = 'counter-update';
        server.to.returns({
            emit: (command: string, info: { counter: number; player: boolean }) => {
                expect(command).toEqual(action);
                expect(info.counter).toEqual(0);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.handleResetCounter(socket, player1);
    });
    it('should reset the counter for player 2', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const player1 = false;
        const action = 'counter-update';
        server.to.returns({
            emit: (command: string, info: { counter: number; player: boolean }) => {
                expect(command).toEqual(action);
                expect(info.counter).toEqual(0);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.handleResetCounter(socket, player1);
    });

    it('should delete according data when handleDisconnect is called', () => {
        const roomId = 'room_id';
        gateway.socketIdToRoomId[socket.id] = roomId;
        socket.leave.restore();
        const leaveStub = sinon.stub(socket, 'leave');

        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, roomId]));

        gateway.handleDisconnect(socket);
        expect(leaveStub.calledWith(roomId)).toBeTruthy();
    });
    it('should increment counter for player 1', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const player1 = true;
        const action = 'counter-update';
        server.to.returns({
            emit: (command: string, info: { counter: number; player: boolean }) => {
                expect(command).toEqual(action);
                expect(info.counter).toEqual(1);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.handleIncrementCounter(socket, player1);
    });
    it('should increment counter for player 2', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const player1 = false;
        const action = 'counter-update';
        server.to.returns({
            emit: (command: string, info: { counter: number; player: boolean }) => {
                expect(command).toEqual(action);
                expect(info.counter).toEqual(1);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.handleIncrementCounter(socket, player1);
    });
    it('should send an update-difference ', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const coords = [{ x: 1, y: 2 }];
        const action = 'update-difference';
        const click = {
            isDifference: true,
            differenceNumber: 1,
            coords,
        };
        server.to.returns({
            emit: (command: string, clickRes: ClickResponse) => {
                expect(command).toEqual(action);
                expect(clickRes).toEqual(click);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onDifferenceFound(socket, click);
    });

    it('should verify the click and emit it to the client', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const coords: Coords[] = [{ x: 1, y: 2 }];
        const action = 'click-response';
        const click: DifferenceInterface = {
            isDifference: true,
            differenceNumber: 1,
            coords: coords,
        };
        jest.spyOn(game, 'verifyPosition').mockReturnValue(click);
        server.to.returns({
            emit: (command: String, clickRes: ClickResponse) => {
                expect(command).toEqual(action);
                expect(clickRes).toEqual(click);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onVerifyPosition(socket, coords[0]);
    });

    it('should switch game cards if there are game cards left ', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const action1 = 'switch-images';
        const newGameInfo = {
            length: 2,
            images: ['image1_orig.bmp', 'image1_modif.bmp'],
            title: 'test',
        };
        jest.spyOn(game, 'switchGame').mockReturnValue(newGameInfo);
        server.to.returns({
            emit: (command: string, clickRes: ClickResponse) => {
                expect(command).toEqual(action1);
                expect(clickRes).toEqual(newGameInfo);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onSwitchGame(socket);
    });

    it('should send victory sequence when there are no more game cards left ', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const action1 = 'send-victorious-player';
        const newGameInfo = {
            length: 0,
            images: [],
            title: 'test',
        };
        jest.spyOn(game, 'switchGame').mockReturnValue(newGameInfo);
        const mockDelete = jest.spyOn(timer, 'deleteTimerData');

        server.to.returns({
            emit: (command: string, player1: boolean) => {
                expect(command).toEqual(action1);
                expect(player1).toEqual(true);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onSwitchGame(socket);
        expect(mockDelete).toHaveBeenCalled();
    });

    it('should delete information for a game room', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const spy = jest.spyOn(game, 'deleteRoomGameInfo');

        gateway.onDeleteRoomGameInfo(socket);
        expect(spy).toHaveBeenCalled();
    });
    it('should add extra time to timer', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const spy = jest.spyOn(timer, 'addToTimer');

        gateway.onAddToTimer(socket);
        expect(spy).toHaveBeenCalled();
    });
    it('should remove time from timer', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const spy = jest.spyOn(timer, 'removeToTimer');

        gateway.onRemoveToTimer(socket);
        expect(spy).toHaveBeenCalled();
    });
    it('should initialize game', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const action = 'switch-images';
        const images = {
            images: ['image1_orig.bmp', 'image1_modif.bmp'],
            title: 'test',
        };
        const gameTitles = [];
        jest.spyOn(game, 'loadGame').mockResolvedValueOnce(images);
        server.to.returns({
            emit: (command: String, imagesRes) => {
                expect(command).toEqual(action);
                expect(imagesRes).toEqual(images);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onInitializeGame(socket, gameTitles);
    });

    it('should delete timer data and make the player leave the game', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const action = 'player-quit-game';

        jest.spyOn(timer, 'deleteTimerData');
        server.to.returns({
            emit: (command: String, data: any) => {
                expect(command).toEqual(action);
                expect(data).toBeFalsy();
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onLeaveGame(socket);
    });

    it('should make the player leave the game after a limited-time game', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const action = 'player-quit-game';

        server.to.returns({
            emit: (command: String, data: any) => {
                expect(command).toEqual(action);
                expect(data).toBeFalsy();
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onLeftlimitedTime(socket);
    });

    it('should emit to all sockets that game card has been deleted', () => {
        const gameTitle = 'game1';
        const action = 'player-quit-game';

        server.to.returns({
            emit: (command: String, data: any) => {
                expect(command).toEqual(action);
                expect(data).toEqual(gameTitle);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onDeleteGame(socket, 'gameTitle');
    });

    it('should send message to the room', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const action = 'incoming-player-message';
        const messageInfo = {
            name: 'user1',
            message: 'Hello World!',
        };

        server.to.returns({
            emit: (command: String, data: any) => {
                expect(command).toEqual(action);
                expect(data).toEqual(messageInfo);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onSendPlayerMessage(socket, messageInfo);
    });
    it('should send success message when called', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const action = 'player-success';
        const userName = 'user1';

        server.to.returns({
            emit: (command: String, data: any) => {
                expect(command).toEqual(action);
                expect(data).toEqual(userName);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onSendPlayerSuccess(socket, userName);
    });
    it('should send error message when called', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const action = 'player-error';
        const userName = 'user1';

        server.to.returns({
            emit: (command: String, data: any) => {
                expect(command).toEqual(action);
                expect(data).toEqual(userName);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onSendPlayerError(socket, userName);
    });

    it('should get info for 1vs1 if player created the lobby', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        gateway.socketIdToRoomId[socket.id] = '1234';
        const action = 'player-info';
        const gameTitle = 'game1';
        const gameInfo: GameInfo = {
            gameMaster: 'master',
            joiningPlayer: 'player',
            gameTitle: gameTitle,
        };
        jest.spyOn(waiting, 'getGameplayInfo').mockReturnValue(gameInfo);

        const gameplayInfo: OneVsOneGameplayInfo = {
            gameTitle: gameInfo.gameTitle,
            roomId: '1234',
            player1: true,
        };
        server.to.returns({
            emit: (command: String, data: any) => {
                expect(command).toEqual(action);
                expect(data).toEqual(gameplayInfo);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onHandleOneVsOneInfo(socket, gameTitle);
    });
    it('should reset lobby state', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const action = 'awaiting-lobby';
        const lobby: Lobby = {
            gameMaster: 'user1',
            gameTitle: 'game1',
        };

        const socketsReplace: PlayerSockets = {
            masterSocket: socket,
        };

        const createSpy = jest.spyOn(waiting, 'createLobby');
        const initSpy = jest.spyOn(waiting, 'initializeGameInfo');

        server.to.returns({
            emit: (command: String, data: any) => {
                expect(command).toEqual(action);
                expect(data).toEqual(socketsReplace);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onResetLobby(socket, lobby);
        expect(createSpy).toHaveBeenCalled();
        expect(initSpy).toHaveBeenCalled();
    });
    it('should emit to joining player that he has been rejected', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const action = 'rejection';
        const lobby: Lobby = {
            gameMaster: 'user1',
            gameTitle: 'game1',
        };
        gateway.socketIdToRoomId[socket.id] = '1234';
        const mockPlayerSockets: PlayerSockets = {
            masterSocket: socket,
            joiningSocket: { leave: sinon.stub() } as Socket,
        };

        gateway.roomIdToPlayerSockets.set('1234', mockPlayerSockets);

        const createSpy = jest.spyOn(waiting, 'createLobby');
        const initSpy = jest.spyOn(waiting, 'initializeGameInfo');

        server.to.returns({
            emit: (command: String, data: any) => {
                expect(command).toEqual(action);
                expect(data).toEqual('/game-selection');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onRejectPlayer(socket, lobby);
        expect(createSpy).toHaveBeenCalled();
        expect(initSpy).toHaveBeenCalled();
    });

    it('should get info for 1vs1 if player did not create the lobby', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        gateway.socketIdToRoomId[socket.id] = '1111';
        const action = 'player-info';
        const gameTitle = 'game1';
        const gameInfo: GameInfo = {
            gameMaster: 'master',
            joiningPlayer: 'player',
            gameTitle: gameTitle,
        };
        jest.spyOn(waiting, 'getGameplayInfo').mockReturnValue(gameInfo);

        const gameplayInfo: OneVsOneGameplayInfo = {
            gameTitle: gameInfo.gameTitle,
            roomId: '1234',
            player1: false,
        };
        server.to.returns({
            emit: (command: String, data: any) => {
                expect(command).toEqual(action);
                expect(data).toEqual(gameplayInfo);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onHandleOneVsOneInfo(socket, gameTitle);
    });

    it('should send message of success when called', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const action = 'new-record';
        const recordInfo = {
            name: 'user1',
            position: '1ere',
            title: 'game1',
            mode: 'solo',
        };

        function* generateRooms() {
            yield 'room1';
            yield 'room2';
        }

        const rooms: IterableIterator<string> = generateRooms();

        jest.spyOn(game, 'getAllRooms').mockReturnValue(rooms);

        server.to.returns({
            emit: (command: String, data: any) => {
                expect(command).toEqual(action);
                expect(data).toEqual(recordInfo);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onNewRecordSet(socket, recordInfo);
    });

    it('should handle victory sequence ', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const action1 = 'new-record-time';
        const action2 = 'send-victorious-player';
        const newTime = 10;

        const getTimeFromRoomSpy = jest.spyOn(timer, 'getTimeFromRoom').mockReturnValue(newTime);
        const deleteTimerDataSpy = jest.spyOn(timer, 'deleteTimerData');

        server.to.returns({
            emit: (command: String, data: any) => {
                if (command === action1) {
                    expect(command).toEqual(action1);
                    expect(data).toEqual(newTime);
                } else if (command === action2) {
                    expect(command).toEqual(action2);
                    expect(data).toEqual(true);
                }
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.handleVictorySequence(socket, true);
        expect(deleteTimerDataSpy).toHaveBeenCalled();
        expect(getTimeFromRoomSpy).toHaveBeenCalled();
    });

    it('should handle connections to lobby if it is new lobby', () => {
        jest.spyOn(waiting, 'isOtherLobby').mockReturnValue(false);
        const action = 'awaiting-lobby';
        const lobby: Lobby = {
            gameMaster: 'user1',
            gameTitle: 'game1',
        };

        socket.join.restore();
        const joinStub = sinon.stub(socket, 'join');

        const createSpy = jest.spyOn(waiting, 'createLobby');
        const initSpy = jest.spyOn(waiting, 'initializeGameInfo');

        server.to.returns({
            emit: (command: String, data: any) => {
                expect(command).toEqual(action);
                expect(data).toEqual(lobby.gameTitle);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onHandleLobby(socket, lobby);
        const roomId = gateway.socketIdToRoomId[socket.id];
        expect(joinStub.calledWith(roomId)).toBeTruthy();
        expect(createSpy).toHaveBeenCalled();
        expect(initSpy).toHaveBeenCalled();
    });

    it('should handle connections to lobby if it is not new lobby', () => {
        const roomId = 'open-lobby';
        jest.spyOn(waiting, 'isOtherLobby').mockReturnValue(true);
        jest.spyOn(waiting, 'joinLobby').mockReturnValue(roomId);
        const action1 = 'lobby-created';
        const action2 = 'completed-lobby';
        const action3 = 'redirectToGame';
        const lobby: Lobby = {
            gameMaster: 'user1',
            gameTitle: 'Temps Limité',
        };

        socket.join.restore();
        const joinStub = sinon.stub(socket, 'join');

        const mockGameInfo: GameInfo = {
            gameMaster: lobby.gameMaster,
            joiningPlayer: 'user2',
            gameTitle: lobby.gameTitle,
        };

        const completeSpy = jest.spyOn(waiting, 'completeGameInfo').mockReturnValue(mockGameInfo);

        const mockCompleteGameInfo: CompleteGameInfo = {
            gameMaster: mockGameInfo.gameMaster,
            joiningPlayer: mockGameInfo.joiningPlayer,
            gameTitle: mockGameInfo.gameTitle,
            roomId: roomId,
        };

        const mockRoomIdToPlayerSockets = new Map<string, PlayerSockets>();
        const mockPlayerSockets: PlayerSockets = {
            masterSocket: socket,
            joiningSocket: socket,
        };

        gateway.roomIdToPlayerSockets.set(roomId, mockPlayerSockets);
        const socketInfo: PlayerSockets = gateway.roomIdToPlayerSockets.get(roomId);

        server.to.returns({
            emit: (command: String, data: any) => {
                if (command === action1) {
                    expect(command).toEqual(action1);
                    expect(data).toEqual(mockCompleteGameInfo);
                } else if (command === action2) {
                    expect(command).toEqual(action2);
                    expect(data).toEqual(lobby.gameTitle);
                } else if (command === action3) {
                    expect(command).toEqual(action3);
                    expect(data).toEqual('/limited-time');
                }
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.onHandleLobby(socket, lobby);
        expect(joinStub.calledWith(roomId)).toBeTruthy();
        expect(completeSpy).toHaveBeenCalled();
    });
});
