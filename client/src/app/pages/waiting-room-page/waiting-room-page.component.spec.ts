import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WaitingRoomService } from '@app/services/waiting-room.service';
import { Socket } from 'socket.io-client';

import { WaitingRoomPageComponent } from './waiting-room-page.component';

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let mockWaitingRoomService: jasmine.SpyObj<WaitingRoomService>;
    let mockSessionStorage: any = {};
    let mockSocket: jasmine.SpyObj<Socket>;

    beforeEach(async () => {
        mockWaitingRoomService = jasmine.createSpyObj<WaitingRoomService>([
            'handleLobby',
            'rejectPlayer',
            'closeLobby',
            'leaveLobby',
            'startOneVsOneGame',
        ]);
        mockSocket = jasmine.createSpyObj<Socket>(['on']);
        await TestBed.configureTestingModule({
            declarations: [WaitingRoomPageComponent],
            imports: [RouterTestingModule],
            providers: [{ provide: WaitingRoomService, useValue: mockWaitingRoomService }],
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
        mockWaitingRoomService.socket = mockSocket;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call handleLobby on ngOnInit() with name and gameTitle gotten in sessionStorage', () => {
        mockSessionStorage['userName'] = 'playerName1';
        mockSessionStorage['gameTitle'] = 'gameTitle1';

        component.ngOnInit();
        expect(mockWaitingRoomService.handleLobby).toHaveBeenCalledWith('playerName1', 'gameTitle1');
    });

    it('should set showPopupKick and showPopupLeave to false when ngOnDestroy is called', () => {
        component.ngOnDestroy();
        expect(component.showPopupKick).toBeFalse();
        expect(component.showPopupLeave).toBeFalse();
    });

    // it('should set lobby info in afterViewInit when "lobby-created is called"', () => {
    //     const gameInfo: CompleteGameInfo = {
    //         gameMaster: 'testGameMaster',
    //         joiningPlayer: 'testPlayer',
    //         gameTitle: 'testGameTitle',
    //         roomId: '1234',
    //     };

    //     const SocketOnSpy = spyOn(mockSocket, 'on').and.callFake((eventName: string, callback: (gameInfo: CompleteGameInfo) => void) =>{

    //     })
    // });

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
        expect(mockWaitingRoomService.rejectPlayer).toHaveBeenCalledWith('test1', 'testGameTitle1');
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

    it('should call waitingRoomService.closeLobby() with gameTitle when leaveLobby is called by gameMaster', () => {
        component.inputName = 'test1';
        component.joiningPlayer = 'test2';
        component.gameTitle = 'gameTitleTest';
        component.leaveLobby();
        expect(mockWaitingRoomService.closeLobby).toHaveBeenCalledWith('gameTitleTest');
    });

    it('should call waitingRoomService.leaveLobby() and navigate to "/game-selection" when leaveLobby is called by joiningPlayer', () => {
        spyOn(component.router, 'navigate');
        component.inputName = 'test1';
        component.joiningPlayer = 'test1';
        component.leaveLobby();
        expect(mockWaitingRoomService.leaveLobby).toHaveBeenCalled();
        expect(component.router.navigate).toHaveBeenCalledWith(['/game-selection']);
    });

    it('should call waitingRoomService.startOneVsOneGame() when startOneVsOneGame is called', () => {
        component.startOneVsOneGame();
        expect(mockWaitingRoomService.startOneVsOneGame).toHaveBeenCalled();
    });
});
