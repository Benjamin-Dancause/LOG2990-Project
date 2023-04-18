/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
import { TestBed } from '@angular/core/testing';
import { Socket } from 'socket.io-client';
import { ReplayService } from '../replay/replay.service';
// eslint-disable-next-line no-restricted-imports
import { SocketService } from '../socket/socket.service';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;
    let socketService: jasmine.SpyObj<SocketService>;
    let replay: jasmine.SpyObj<ReplayService>;
    let mockSessionStorage: any = {};
    let mockSocket: jasmine.SpyObj<Socket>;

    beforeEach(() => {
        socketService = jasmine.createSpyObj('SocketService', ['resetTimer', 'sendVictoriousPlayer']);
        replay = jasmine.createSpyObj('ReplayService', ['addAction']);
        mockSocket = jasmine.createSpyObj<Socket>(['on', 'emit']);
        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.emit.and.returnValue(mockSocket);

        TestBed.configureTestingModule({
            providers: [TimerService, { provide: SocketService, useValue: socketService }, { provide: ReplayService, useValue: replay }],
        });
        service = TestBed.inject(TimerService);
        socketService.socket = mockSocket;
        mockSessionStorage = {};

        spyOn(sessionStorage, 'getItem').and.callFake((key: string): string => {
            return mockSessionStorage[key] || null;
        });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return an Observable of numbers when calling getTime', () => {
        const time = 100;
        mockSocket.emit('timer', time);
        service.getTime().subscribe((result) => {
            expect(result).toEqual(time);
        });
    });

    it('should call the socketService sendVictoriousPlayer function when gameMode is tl and time is 0', () => {
        const mockObserver = jasmine.createSpyObj(['next']);
        const time = 0;
        mockSessionStorage['gameMode'] = 'tl';

        service.getTime().subscribe(mockObserver);
        mockSocket.on.calls.mostRecent().args[1](time);

        expect(mockObserver.next).toHaveBeenCalledWith(time);
        expect(socketService.sendVictoriousPlayer).toHaveBeenCalledWith(true);
    });

    it('should call the resetTimer() function from the socket-service', () => {
        const roomId = '12345';
        service.resetTimer(roomId);
        expect(socketService.resetTimer).toHaveBeenCalledWith(roomId);
    });
});
