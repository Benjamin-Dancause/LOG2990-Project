import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketService } from '@app/services/socket/socket.service';
import { CompleteGameInfo } from '@common/game-interfaces';
import { Socket } from 'socket.io-client';
import { WaitingRoomLimitedPageComponent } from './waiting-room-limited-page.component';

describe('WaitingRoomLimitedPageComponent', () => {
    let component: WaitingRoomLimitedPageComponent;
    let fixture: ComponentFixture<WaitingRoomLimitedPageComponent>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockSocket: jasmine.SpyObj<Socket>;
    let mockRouter: Router;

    beforeEach(() => {
        mockSocketService = jasmine.createSpyObj('SocketService', ['handleLobby', 'closeLobby']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockSocket = jasmine.createSpyObj<Socket>(['on', 'emit']);
        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.emit.and.returnValue(mockSocket);

        TestBed.configureTestingModule({
            declarations: [WaitingRoomLimitedPageComponent],
            imports: [RouterTestingModule, HttpClientModule],
            providers: [
                { provide: SocketService, useValue: mockSocketService },
                { provide: Router, useValue: mockRouter },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingRoomLimitedPageComponent);
        component = fixture.componentInstance;
        mockSocketService.socket = mockSocket;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should set gameMaster, joiningPlayer, roomId and awaitingPlayer to true on lobby-created event', () => {
        const gameInfo: CompleteGameInfo = {
            gameMaster: 'testId',
            joiningPlayer: 'testMaster',
            gameTitle: 'testJoiningPlayer',
            roomId: 'testRoomId',
        };

        mockSocket.on.withArgs('lobby-created', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(gameInfo);
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('lobby-created', gameInfo);
        expect(component.gameMaster).toBe(gameInfo.gameMaster);
        expect(sessionStorage.getItem('gameMaster')).toBe(gameInfo.gameMaster);
        expect(component.joiningPlayer).toBe(gameInfo.joiningPlayer);
        expect(sessionStorage.getItem('joiningPlayer')).toBe(gameInfo.joiningPlayer);
        expect(component.roomId).toBe(gameInfo.roomId);
        expect(sessionStorage.getItem('roomId')).toBe(gameInfo.roomId);
        expect(component.awaitingPlayer).toBeTrue();
    });

    it('should navigate to game on redirectToGame emit', () => {
        const url = 'http://localhost:3000/game';

        mockSocket.on.withArgs('redirectToGame', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(url);
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('redirectToGame', url);
        expect(mockRouter.navigate).toHaveBeenCalledWith([url]);
    });

    it('should call closeLobby and navigate to home on leaveLobby', () => {
        component.gameTitle = 'testGame';
        component.leaveLobby();
        expect(mockSocketService.closeLobby).toHaveBeenCalledWith('testGame');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });
    /*

    */
});
