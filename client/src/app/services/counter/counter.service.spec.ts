import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { Socket } from 'socket.io-client';
import { CommunicationService } from '../communication/communication.service';
import { CounterService } from './counter.service';



fdescribe('CounterService', () => {
    let service: CounterService;
    let mockSessionStorage: any = {};
    let mockSocket: jasmine.SpyObj<Socket>;
    let communicationSpy: jasmine.SpyObj<CommunicationService>;

    beforeEach(() => {
        communicationSpy = jasmine.createSpyObj('CommuncationService', ['getDiffAmount']);
        mockSocket = jasmine.createSpyObj<Socket>(['on', 'emit']);
        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.emit.and.returnValue(mockSocket);

        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [CounterService, {provide: CommunicationService, useValue: communicationSpy}],
        });
        service = TestBed.inject(CounterService);
        communicationSpy = TestBed.inject(CommunicationService) as jasmine.SpyObj<CommunicationService>;
        
        mockSessionStorage = {};
        
        spyOn(sessionStorage, 'getItem').and.callFake((key: string): string => {
            return mockSessionStorage[key] || null;
        });

        spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string): void => {
            mockSessionStorage[key] = value;
        });
    });

    afterEach(() => {
        if(service.allDiffsSubscription instanceof Subscription) {
            service.allDiffsSubscription.unsubscribe();
        }
    })

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set win condition', () => {
        spyOn(service, 'setWinCondition');
        service.initializeCounter();
        expect(service.setWinCondition).toHaveBeenCalled();
    });

    it('should set win condition based on game mode', () => {
        const totalDiff = 7;
        const gameMode = '1v1';
        mockSessionStorage.setItem('gameTitle', 'testGame');
        mockSessionStorage.setItem('gameMode', gameMode);
        
        service.initializeCounter();
        expect(service.winCondition).toEqual(Math.ceil(totalDiff / 2));
    });

    it('should set the win condition to total differences in solo mode', () => {
        const totalDiff = 7;
        const gameMode = 'solo';
        sessionStorage.setItem('gameTitle', 'testGame');
        sessionStorage.setItem('gameMode', gameMode);
        
        service.initializeCounter();
        expect(service.winCondition).toEqual(totalDiff);
    });

    it('should listen to counter-update event from socket service', () => {
        service.initializeCounter();
        expect(mockSocket.on).toHaveBeenCalledWith('counter-update', jasmine.any(Function));
    });
});
