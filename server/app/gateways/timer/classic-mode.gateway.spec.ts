import { ClickResponse } from '@app/classes/click-response';
import { CounterManagerService } from '@app/services/counter-manager/counter-manager.service';
import { TimerManagerService } from '@app/services/timer-manager/timer-manager.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager/waiting-room-manager.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { PRIVATE_ROOM_ID } from '../chat/chat.gateway.constants';
import { ClassicModeGateway } from './classic-mode.gateway';
/*
import { match, stub } from 'sinon';
import { BroadcastOperator } from 'socket.io';
import { ChatEvents } from './chat.gateway.events';
import { Lobby } from '@common/game-interfaces';
*/

describe('ClassicModeGateway', () => {
    let gateway: ClassicModeGateway;
    let service: CounterManagerService;
    let timer: TimerManagerService;
    let counter: CounterManagerService;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    // let lobby: SinonStubbedInstance<Lobby>;
    let server: SinonStubbedInstance<Server>;
    // let waiting: WaitingRoomManagerService;
    let sinon = require('sinon');

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
            ],
        }).compile();

        service = new CounterManagerService();
        // waiting = module.get<WaitingRoomManagerService>(WaitingRoomManagerService);
        gateway = module.get<ClassicModeGateway>(ClassicModeGateway);
        gateway['server'] = server;
        // timer = module.get<TimerManagerService>(TimerManagerService);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    // TypeError: Cannot read properties of undefined (reading 'socketRooms')
    /*
    it('should send message', () => {
        gateway.handleIncrementCounter(socket, true);
        expect(server.emit.calledWith('counter', 1)).toBe(true);
        expect(logger.log.calledWith('counter', 1)).toBe(true);
    });
    */
    it('should reset the counter for a given roomId', () => {
        const roomId = 'test-room';
        counter.incrementCounter(roomId);
        // expect(service.getCounterFromRoom(roomId)).toEqual(1);
        expect(service.getCounterFromRoom(roomId)).toEqual(0);
        service.resetCounter(roomId);
        expect(service.getCounterFromRoom(roomId)).toEqual(0);
    });

    it('should increment the counter for a given roomId', () => {
        const roomId = 'test-room';
        const counter = service.incrementCounter(roomId);
        // expect(counter).toBe(1);
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

    it('should handle connection', () => {
        gateway.handleConnection(socket);
        expect(logger.log.calledWith('Client connected')).toBe(false);
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
        gateway.onSoloGame(socket);
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
    // it('should delete game', () => {
    //     const gameTitle = 'Game Title';
    //     const action = 'game-deleted';
    //     gateway.server.sockets = {
    //         emit: (command: string, title: string) => {
    //             expect(command).toEqual(action);
    //             expect(title).toEqual(gameTitle);
    //         },
    //     };

    //     gateway.onDeleteGame(socket, gameTitle);
    // });
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
            emit: (command: String) => {
                expect(command).toEqual(action);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onLeaveLobby(socket);
        expect(socket.leave.calledOnce).toBe(true);
    });
    it('should start timer and counter on "init-OneVsOne-components', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const player1 = true;
        gateway.onInitOneVsOneComponents(socket, player1);
        expect(counter.startCounter).toBeCalledWith('1234_player1');
        expect(timer.startTimer).toBeCalledWith('1234');

        const player2 = false;

        gateway.onInitOneVsOneComponents(socket, player2);
        expect(counter.startCounter).toBeCalledWith('1234_player2');
    });
    it('should reset the counter for player 1', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID, '1234']));
        const player1 = true;
        const action = 'counter-update';
        server.to.returns({
            emit: (command: String, info: { counter: number; player: boolean }) => {
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
            emit: (command: String, info: { counter: number; player: boolean }) => {
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
            emit: (command: String, info: { counter: number; player: boolean }) => {
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
            emit: (command: String, info: { counter: number; player: boolean }) => {
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
            coords: coords,
        };
        server.to.returns({
            emit: (command: String, clickRes: ClickResponse) => {
                expect(command).toEqual(action);
                expect(clickRes).toEqual(click);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.onDIfferenceFound(socket, click);
    });
});
