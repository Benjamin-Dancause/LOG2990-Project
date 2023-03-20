import { CounterManagerService } from '@app/services/counter-manager/counter-manager.service';
import { TimerManagerService } from '@app/services/timer-manager/timer-manager.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager/waiting-room-manager.service';
import { Lobby } from '@common/game-interfaces';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { ClassicModeGateway } from './classic-mode.gateway';
/*
import { match, stub } from 'sinon';
import { BroadcastOperator } from 'socket.io';
import { ChatEvents } from './chat.gateway.events';
*/

describe('ClassicModeGateway', () => {
    let gateway: ClassicModeGateway;
    let service: CounterManagerService;
    let timer: TimerManagerService;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let lobby: SinonStubbedInstance<Lobby>;
    let server: SinonStubbedInstance<Server>;
    let waiting: WaitingRoomManagerService;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClassicModeGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                CounterManagerService,
                TimerManagerService,
                WaitingRoomManagerService,
            ],
        }).compile();

        // service = module.get<CounterManagerService>(CounterManagerService);
        service = new CounterManagerService();
        waiting = module.get<WaitingRoomManagerService>(WaitingRoomManagerService);
        gateway = module.get<ClassicModeGateway>(ClassicModeGateway);
        gateway['server'] = server;
        timer = module.get<TimerManagerService>(TimerManagerService);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should send message', () => {
        gateway.handleIncrementCounter(socket, true);
        expect(server.emit.calledWith('counter', 1)).toBe(true);
        expect(logger.log.calledWith('counter', 1)).toBe(true);
    });

    describe('resetCounter', () => {
        it('should reset the counter for a given roomId', () => {
            const roomId = 'test-room';
            service.incrementCounter(roomId);
            expect(service.getCounterFromRoom(roomId)).toEqual(1);
            service.resetCounter(roomId);
            expect(service.getCounterFromRoom(roomId)).toEqual(0);
        });
    });

    describe('handleIncrementCounter', () => {
        it('should increment the counter for a given roomId', () => {
            const roomId = 'test-room';
            const counter = service.incrementCounter(roomId);
            expect(counter).toBe(1);
        });
    });
    describe('emitTimeToRoom', () => {
        it('should emit time to room', () => {
            const roomId = 'test-room';
            const time = 10;
            gateway.emitTimeToRoom(roomId, time);
            expect(server.to.calledWith(roomId)).toBe(true);
            expect(server.emit.calledWith('time', time)).toBe(true);
        });
    });

    describe('handleConnection', () => {
        it('should handle connection', () => {
            gateway.handleConnection(socket);
            expect(logger.log.calledWith('Client connected')).toBe(false);
        });

        it('should handle multiple connection', () => {
            gateway.handleConnection(socket);
            expect(logger.log.calledWith('Client connected')).toBe(false);
            gateway.handleConnection(socket);
            expect(logger.log.calledWith('Client connected')).toBe(false);
        });
    });

    describe('handleDisconnect', () => {
        it('should handle disconnect', () => {
            gateway.handleDisconnect(socket);
            expect(logger.log.calledWith('Client disconnected')).toBe(false);
        });
    });

    describe('onHandleLobby', () => {
        it('should handle lobby', () => {
            gateway.onHandleLobby(socket, lobby);
            expect(logger.log.calledWith('Client disconnected')).toBe(false);
        });
    });
});
