/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-imports */
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { CommunicationService } from '../communication/communication.service';
import { SocketService } from '../socket/socket.service';
import { CounterService } from './counter.service';

describe('CounterService', () => {
    let service: CounterService;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockCommunicationService: jasmine.SpyObj<CommunicationService>;
    let mockSocket: jasmine.SpyObj<Socket>;

    beforeEach(() => {
        const communicationSpy = jasmine.createSpyObj('CommunicationService', ['getDiffAmount', 'getBestTimesForGame']);
        mockSocketService = jasmine.createSpyObj('SocketService', ['incrementCounter', 'resetCounter', 'sendVictoriousPlayer']);
        mockSocket = jasmine.createSpyObj('Socket', ['on', 'emit', 'off']);

        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.on.and.returnValue(mockSocket);

        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [
                CounterService,
                { provide: CommunicationService, useValue: communicationSpy },
                { provide: SocketService, useValue: mockSocketService },
            ],
        });

        service = TestBed.inject(CounterService);
        mockCommunicationService = TestBed.inject(CommunicationService) as jasmine.SpyObj<CommunicationService>;
        mockSocketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        mockSocketService.socket = mockSocket;
    });

    afterEach(() => {
        service.unsubscribeFrom();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize counter and set up socket listener correctly', () => {
        const gameTitle = 'testTitle';
        const gameMode = 'solo';
        const totalDiff = 10;
        const counterInfo = { counter: 5, player1: true };

        spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
            if (key === 'gameTitle') return gameTitle;
            if (key === 'gameMode') return gameMode;
            return null;
        });

        mockCommunicationService.getDiffAmount.and.returnValue(of(totalDiff));

        const onSpy = mockSocketService.socket.on as jasmine.Spy;
        onSpy.and.callFake((eventName: string, callback: Function) => {
            expect(eventName).toBe('counter-update');
            callback(counterInfo);
        });

        service.initializeCounter();

        expect(onSpy).toHaveBeenCalledWith('counter-update', jasmine.any(Function));
        expect(service.counter).toEqual(counterInfo.counter);
    });

    it('should initialize counter and set up socket listener correctly while entering the multiplayer condition', () => {
        const gameTitle = 'testTitle';
        const gameMode = '1v1';
        const totalDiff = 10;
        const counterInfo = { counter: 5, player1: false };

        spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
            if (key === 'gameTitle') return gameTitle;
            if (key === 'gameMode') return gameMode;
            return null;
        });

        mockCommunicationService.getDiffAmount.and.returnValue(of(totalDiff));

        const onSpy = mockSocketService.socket.on as jasmine.Spy;
        onSpy.and.callFake((eventName: string, callback: Function) => {
            expect(eventName).toBe('counter-update');
            callback(counterInfo);
        });

        service.initializeCounter();

        expect(onSpy).toHaveBeenCalledWith('counter-update', jasmine.any(Function));
        expect(service.counter2).toEqual(counterInfo.counter);
    });

    it('should set the win condition to total differences in solo mode', () => {
        const totalDiff = 10;
        mockCommunicationService.getDiffAmount.and.returnValue(of(totalDiff));
        service.setWinCondition('solo', 'title');
        expect(service.winCondition).toEqual(totalDiff);
    });

    it('should set the win condition to half the differences in 1vs1 mode', () => {
        const totalDiff = 9;
        mockCommunicationService.getDiffAmount.and.returnValue(of(totalDiff));
        service.setWinCondition('1v1', 'title');
        expect(service.winCondition).toEqual(Math.ceil(totalDiff / 2));
    });

    it('should set the win condition to 1000 if not solo or 1v1', () => {
        const gameDiff = 4;
        const totalDiff = 1000;
        mockCommunicationService.getDiffAmount.and.returnValue(of(gameDiff));
        service.setWinCondition('tl', 'title');
        expect(service.winCondition).toEqual(totalDiff);
    });

    it('should increment the counter correctly when incrementCounter() is called', () => {
        const player1 = true;
        service.incrementCounter(player1);
        expect(mockSocketService.incrementCounter).toHaveBeenCalledWith(true);
    });

    it('should reset the counter when resetCounter() is called', () => {
        const player1 = true;
        service.resetCounter(player1);
        expect(service.counter).toEqual(0);
        expect(service.counter2).toEqual(0);
        expect(mockSocketService.resetCounter).toHaveBeenCalledWith(true);
    });

    it('should send the correct victorious player when sendVictoriousPlayer() is called', () => {
        const gameTitle = 'testTitle';
        const gameMaster = 'abc';
        const userName = 'def';
        const gameMode = '1v1';
        const totalDiff = 10;
        const counterInfo = { counter: 5, player1: false };
        service.victorySent = false;
        spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
            if (key === 'gameTitle') return gameTitle;
            if (key === 'gameMode') return gameMode;
            if (key === 'gameMaster') return gameMaster;
            if (key === 'userName') return userName;
            return null;
        });

        mockSocket.on.withArgs('counter-update', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(counterInfo);
            return mockSocket;
        });

        mockCommunicationService.getDiffAmount.and.returnValue(of(totalDiff));

        service.initializeCounter();
        mockSocket.emit('counter-update', counterInfo);
        expect(mockSocket.on).toHaveBeenCalledWith('counter-update', jasmine.any(Function));
        expect(mockSocketService.sendVictoriousPlayer).toHaveBeenCalledWith(false);
    });

    it('should emit "1ère" message if newTime is better than the first best time', () => {
        const gameTitle = 'gameTitle';
        const bestTimes: number[] = [300, 400, 600];

        const recordMessageSpy = spyOn(service.recordMessage, 'emit');

        mockCommunicationService.getBestTimesForGame.and.returnValue(of(bestTimes));

        service.isNewBestTime(gameTitle);
        const newTime = 50;
        mockSocket.emit('new-record-time', newTime);
        const newRecordTimeCallback = mockSocket.on.calls.argsFor(0)[1];
        newRecordTimeCallback(newTime);

        expect(mockSocket.on).toHaveBeenCalledWith('new-record-time', jasmine.any(Function));
        expect(recordMessageSpy).toHaveBeenCalledWith('1ère');
    });

    it('should emit "2e" message if newTime is better than the second best time', () => {
        const gameTitle = 'gameTitle';
        const bestTimes: number[] = [300, 400, 600];

        const recordMessageSpy = spyOn(service.recordMessage, 'emit');

        mockCommunicationService.getBestTimesForGame.and.returnValue(of(bestTimes));

        service.isNewBestTime(gameTitle);
        const newTime = 350;
        mockSocket.emit('new-record-time', newTime);
        const newRecordTimeCallback = mockSocket.on.calls.argsFor(0)[1];
        newRecordTimeCallback(newTime);

        expect(mockSocket.on).toHaveBeenCalledWith('new-record-time', jasmine.any(Function));
        expect(recordMessageSpy).toHaveBeenCalledWith('2e');
    });

    it('should emit "3e" message if newTime is better than the third best time', () => {
        const gameTitle = 'gameTitle';
        const bestTimes: number[] = [300, 400, 600];

        const recordMessageSpy = spyOn(service.recordMessage, 'emit');

        mockCommunicationService.getBestTimesForGame.and.returnValue(of(bestTimes));

        service.isNewBestTime(gameTitle);
        const newTime = 450;
        mockSocket.emit('new-record-time', newTime);
        const newRecordTimeCallback = mockSocket.on.calls.argsFor(0)[1];
        newRecordTimeCallback(newTime);

        expect(mockSocket.on).toHaveBeenCalledWith('new-record-time', jasmine.any(Function));
        expect(recordMessageSpy).toHaveBeenCalledWith('3e');
    });
});
