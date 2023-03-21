import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketService } from '@app/services/socket/socket.service';
import { CompleteGameInfo } from '@common/game-interfaces';
import { Socket } from 'socket.io-client';

import { WaitingRoomPageComponent } from './waiting-room-page.component';

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockSessionStorage: any = {};
    let mockSocket: jasmine.SpyObj<Socket>;

    beforeEach(async () => {
        mockSocketService = jasmine.createSpyObj<SocketService>([
            'handleLobby',
            'rejectPlayer',
            'closeLobby',
            'leaveLobby',
            'startOneVsOneGame',
            'resetLobby',
        ]);
        mockSocket = jasmine.createSpyObj<Socket>(['on', 'emit']);
        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.emit.and.returnValue(mockSocket);

        await TestBed.configureTestingModule({
            declarations: [WaitingRoomPageComponent],
            imports: [RouterTestingModule, HttpClientModule],
            providers: [{ provide: SocketService, useValue: mockSocketService }],
        }).compileComponents();

        mockSessionStorage = {};

        spyOn(sessionStorage, 'getItem').and.callFake((key: string): string => {
            return mockSessionStorage[key] || null;
        });

        spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string): void => {
            mockSessionStorage[key] = value;
        });

        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        component = fixture.componentInstance;
        mockSocketService.socket = mockSocket;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call handleLobby on ngOnInit() with name and gameTitle gotten in sessionStorage', () => {
        mockSessionStorage['userName'] = 'playerName1';
        mockSessionStorage['gameTitle'] = 'gameTitle1';

        component.ngOnInit();
        expect(mockSocketService.handleLobby).toHaveBeenCalledWith('playerName1', 'gameTitle1');
    });

    it('should set showPopupKick and showPopupLeave to false when ngOnDestroy is called', () => {
        component.ngOnDestroy();
        expect(component.showPopupKick).toBeFalse();
        expect(component.showPopupLeave).toBeFalse();
    });

    it('should set lobby info in afterViewInit when "lobby-created is called"', () => {
        const gameInfo: CompleteGameInfo = {
            gameMaster: 'testGameMaster',
            joiningPlayer: 'testPlayer',
            gameTitle: 'testGameTitle',
            roomId: '1234',
        };

        mockSocket.on.withArgs('lobby-created', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(gameInfo);
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('lobby-created', gameInfo);

        expect(component.gameMaster).toBe(gameInfo.gameMaster);
        expect(component.joiningPlayer).toBe(gameInfo.joiningPlayer);
        expect(component.roomId).toBe(gameInfo.roomId);
    });

    it('should navigate to game URL when "redirectToGame" event is emitted', () => {
        spyOn(component.router, 'navigate');
        const url = component.router.url;

        mockSocket.on.withArgs('redirectToGame', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(url);
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('redirectToGame', url);
        expect(component.router.navigate).toHaveBeenCalledWith([url]);
    });

    it('should set popUpRejection to true when "rejection" is called', () => {
        const url = '/game-selection';
        mockSocket.on.withArgs('rejection', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(url);
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('rejection', url);
        expect(component.showPopupKick).toBeTrue();
    });

    it('should set popUpDeleted to true when "game-deleted" is called and player is in the deleted game lobby', () => {
        const gameTitle = 'game1';
        component.gameTitle = 'game1';
        mockSocket.on.withArgs('game-deleted', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(gameTitle);
            return mockSocket;
        });
        component.ngAfterViewInit();
        mockSocket.emit('game-deleted', gameTitle);
        expect(component.showPopupDeleted).toBeTrue();
    });

    it('should call socketService.resetLobby() and set awaitingPlayer to false when "player-left" event is emitted', () => {
        component.gameMaster = 'testGameMaster';
        component.gameTitle = 'testGameTitle';
        mockSocket.on.withArgs('player-left', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback();
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('player-left');
        expect(component.awaitingPlayer).toBeFalse();
        expect(mockSocketService.resetLobby).toHaveBeenCalledWith('testGameMaster', 'testGameTitle');
    });

    it('should set popUpLeave to true when "lobby-closed" event is emitted and player is joiningPlayer', () => {
        component.inputName = 'testPlayer1';
        component.joiningPlayer = 'testPlayer1';
        mockSocket.on.withArgs('lobby-closed', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback();
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('lobby-closed');
        expect(component.showPopupLeave).toBeTrue();
    });

    it('should set popUpLeave to true when "lobby-closed" event is emitted and player is joiningPlayer', () => {
        spyOn(component.router, 'navigate');
        const url = component.router.url;
        component.inputName = 'testPlayer1';
        component.joiningPlayer = 'testPlayer2';
        mockSocket.on.withArgs('lobby-closed', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(url);
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('lobby-closed');
        expect(component.router.navigate).toHaveBeenCalledWith([url]);
    });

    it('isPlayerJoin() should returnTrue if inputName is same as gameMaster', () => {
        component.inputName = 'test1';
        component.gameMaster = 'test1';

        expect(component.isPlayerJoin()).toBeTrue();
    });

    it('isPlayerJoin() should returnTrue if inputName is same as gameMaster', () => {
        component.inputName = 'test1';
        component.gameMaster = 'test1';

        expect(component.isPlayerJoin()).toBeTrue();
    });

    it('isPlayerJoin() should returnTrue if inputName is different than gameMaster', () => {
        component.inputName = 'test1';
        component.gameMaster = 'geageageagaegage';

        expect(component.isPlayerJoin()).toBeFalse();
    });

    it('should call rejectPlayer() when rejectPlayer() is called', () => {
        component.inputName = 'test1';
        component.gameTitle = 'testGameTitle1';
        component.rejectPlayer();
        expect(mockSocketService.rejectPlayer).toHaveBeenCalledWith('test1', 'testGameTitle1');
    });

    it('should navigate to current url when rejectPlayer() is called', () => {
        spyOn(component.router, 'navigate');
        component.rejectPlayer();
        expect(component.router.navigate).toHaveBeenCalledOnceWith([component.router.url]);
    });

    it('should set awaitingPlayer to false when rejectPlayer() is called', () => {
        component.rejectPlayer();
        expect(component.awaitingPlayer).toBeFalse();
    });

    it('incomingPlayer() should return true if awaitingPlayer is true and inputName is same as gameMaster', () => {
        component.awaitingPlayer = true;
        component.gameMaster = 'test1';
        component.inputName = 'test1';
        expect(component.incomingPlayer()).toBeTrue();
    });

    it('incomingPlayer() should return false if awaitingPlayer is true but inputName is different than gameMaster', () => {
        component.awaitingPlayer = true;
        component.gameMaster = 'test2';
        component.inputName = 'test1';
        expect(component.incomingPlayer()).toBeFalse();
    });

    it('incomingPlayer() should return true if awaitingPlayer is false', () => {
        component.awaitingPlayer = false;
        component.gameMaster = 'test1';
        component.inputName = 'test1';
        expect(component.incomingPlayer()).toBeFalse();
    });

    it('should call socketService.closeLobby() with gameTitle when leaveLobby is called by gameMaster', () => {
        component.inputName = 'test1';
        component.joiningPlayer = 'test2';
        component.gameTitle = 'gameTitleTest';
        component.leaveLobby();
        expect(mockSocketService.closeLobby).toHaveBeenCalledWith('gameTitleTest');
    });

    it('should call socketService.leaveLobby() and navigate to "/game-selection" when leaveLobby is called by joiningPlayer', () => {
        spyOn(component.router, 'navigate');
        component.inputName = 'test1';
        component.joiningPlayer = 'test1';
        component.leaveLobby();
        expect(mockSocketService.leaveLobby).toHaveBeenCalled();
        expect(component.router.navigate).toHaveBeenCalledWith(['/game-selection']);
    });

    it('should call socketService.startOneVsOneGame() when startOneVsOneGame is called and call addPlayer() on both players', () => {
        spyOn(component.gameCardService, 'addPlayer').and.callThrough();
        component.startOneVsOneGame();
        expect(mockSocketService.startOneVsOneGame).toHaveBeenCalled();
    });
});
