import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { GiveUpButtonComponent } from '@app/components/give-up-button/give-up-button.component';
import { HintsComponent } from '@app/components/hints/hints.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { TopBarComponent } from '@app/components/top-bar/top-bar.component';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { GameOneVsOnePageComponent } from './game-one-vs-one-page.component';

describe('GamePageOneVsOneComponent', () => {
    let component: GameOneVsOnePageComponent;
    let fixture: ComponentFixture<GameOneVsOnePageComponent>;
    let gameCardService: jasmine.SpyObj<GameCardService>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockSessionStorage: any = {};
    let mockSocket: jasmine.SpyObj<Socket>;
    let mockPlayArea: jasmine.SpyObj<PlayAreaComponent>;

    beforeEach(async () => {
        mockSocket = jasmine.createSpyObj<Socket>(['on', 'emit', 'off']);
        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.emit.and.returnValue(mockSocket);
        mockSocketService = jasmine.createSpyObj<SocketService>(['soloGame', 'initializeGame', 'deleteRoomGameInfo', 'disconnectSocket'], {
            socket: mockSocket,
        });
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        mockSocketService.disconnectSocket.and.callFake(() => {});
        gameCardService = jasmine.createSpyObj<GameCardService>(['removePlayer']);
        mockPlayArea = jasmine.createSpyObj<PlayAreaComponent>(['initCanvases']);
        mockPlayArea.initCanvases.and.returnValue(Promise.resolve());

        await TestBed.configureTestingModule({
            declarations: [
                GameOneVsOnePageComponent,
                SidebarComponent,
                GiveUpButtonComponent,
                TopBarComponent,
                TimerComponent,
                HintsComponent,
                PlayAreaComponent,
            ],
            imports: [HttpClientModule, MatDialogModule],
            providers: [
                { provide: SocketService, useValue: mockSocketService },
                { provide: GameCardService, useValue: gameCardService },
            ],
        }).compileComponents();

        mockSessionStorage = {};

        spyOn(sessionStorage, 'getItem').and.callFake((key: string): string => {
            return mockSessionStorage[key] || null;
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameOneVsOnePageComponent);
        component = fixture.componentInstance;
        component.playArea = mockPlayArea;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set showPopup to false when returnToMainMenu is called', () => {
        component.gameTitle = 'test1';
        component.userName = 'player';
        gameCardService.removePlayer.and.returnValue(of(null));

        component.returnToMainMenu();
        expect(component.gameCardService.removePlayer).toHaveBeenCalledWith('test1', 'player');
    });

    it('should set showPopup to false', () => {
        component.showPopup = true;
        gameCardService.removePlayer.and.returnValue(of(null));

        component.returnToMainMenu();
        expect(component.showPopup).toBeFalse();
    });

    it('should set showPopup to true when socket emits "send-victorious-player" and counter is bigger than counter2', () => {
        component.counterService.counter = 3;
        component.counterService.counter2 = 0;
        mockSocket.on.withArgs('send-victorious-player', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback();
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('send-victorious-player');
        expect(component.showPopup).toBeTrue();
    });

    it('should set showPopup to true when socket emits "send-victorious-player"', () => {
        mockSocket.on.withArgs('send-victorious-player', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback();
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('send-victorious-player');
        expect(component.showPopup).toBeTrue();
    });

    it('should set winningPlayer to gameMaster if player is joiningPlayer"', () => {
        mockSocket.on.withArgs('send-victorious-player', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback();
            return mockSocket;
        });

        mockSessionStorage['userName'] = 'player1';
        mockSessionStorage['gameMaster'] = 'player2';
        mockSessionStorage['joiningPlayer'] = 'player1';

        component.counterService.counter = 1;
        component.counterService.counter2 = 5;

        component.ngAfterViewInit();
        mockSocket.emit('send-victorious-player');
        expect(component.winningPlayer).toBe('player2');
    });

    it('should set winningPlayer to gameMaster if player is joiningPlayer"', () => {
        mockSessionStorage['userName'] = 'player1';
        mockSessionStorage['gameMaster'] = 'player2';
        const result = component.isPlayer1();
        expect(result).toEqual(false);
    });

    it('should set showPopup to true when socket emits "send-victorious-player"', () => {
        mockSocket.on.withArgs('player-quit-game', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback();
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('player-quit-game');
        expect(component.showPopup).toBeTrue();
    });

    it('should set replayMode to true and call playArea.initCanvases() when startReplay() is called', () => {
        component.startReplay();
        spyOn(component.playArea, 'initCanvases').and.returnValue(Promise.resolve());

        expect(component.showPopup).toBeFalse();
        expect(component.replayMode).toBeTrue();
    });
});
