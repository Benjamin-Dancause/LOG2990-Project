/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
import { TestBed } from '@angular/core/testing';
// eslint-disable-next-line no-restricted-imports
import { SocketService } from '../socket/socket.service';
import { TimerService } from './timer.service';

class MockSocketService {
    socket = {
        // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
        on(eventName: string, callback: Function) {},
    };

    resetTimer(roomId: string) {}
}

describe('TimerService', () => {
    let service: TimerService;
    let socketService: MockSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TimerService, { provide: SocketService, useClass: MockSocketService }],
        });
        service = TestBed.inject(TimerService);
        socketService = TestBed.inject(SocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return an Observable of numbers when calling getTime', () => {
        const time = 100;
        spyOn(socketService.socket, 'on').and.callFake((eventName: string, callback: Function) => {
            callback(time);
        });

        service.getTime().subscribe((result) => {
            expect(result).toEqual(time);
        });
    });

    it('should call the resetTimer() function from the socket-service', () => {
        const roomId = '12345';
        spyOn(socketService, 'resetTimer');
        service.resetTimer(roomId);
        expect(socketService.resetTimer).toHaveBeenCalledWith(roomId);
    });
});
