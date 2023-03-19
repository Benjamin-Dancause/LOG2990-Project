import { TestBed } from '@angular/core/testing';
import { Socket } from 'socket.io-client';

import { WaitingRoomService } from './waiting-room.service';

fdescribe('WaitingRoomService', () => {
    let service: WaitingRoomService;
    let socketSpy: jasmine.SpyObj<Socket>;

    beforeEach(() => {
        socketSpy = jasmine.createSpyObj('Socket', ['emit', 'connect', 'disconnect']);
        TestBed.configureTestingModule({});
        service = TestBed.inject(WaitingRoomService);
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

    it('should emit "solo-game" when soloGame() is called', () => {
        service.soloGame();
        expect(socketSpy.emit).toHaveBeenCalledWith('solo-game');
    });
});
