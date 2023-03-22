/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-imports */
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CommunicationService } from '../communication/communication.service';
import { SocketService } from '../socket/socket.service';
import { CounterService } from './counter.service';

describe('CounterService', () => {
    let service: CounterService;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockCommunicationService: jasmine.SpyObj<CommunicationService>;

    beforeEach(() => {
        const communicationSpy = jasmine.createSpyObj('CommunicationService', ['getDiffAmount']);
        mockSocketService = jasmine.createSpyObj('SocketService', ['incrementCounter', 'resetCounter', 'sendVictoriousPlayer']);
        mockSocketService.socket = jasmine.createSpyObj('Socket', ['on']);

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
        expect(mockSocketService.sendVictoriousPlayer).toHaveBeenCalledWith(false);
    });
});
