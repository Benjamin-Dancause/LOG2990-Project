import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { CommunicationService } from '@app/services/communication/communication.service';
import { CounterService } from '@app/services/counter/counter.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { GameOneVsOnePageComponent } from './game-one-vs-one-page.component';

describe('GamePageOneVsOneComponent', () => {
    let component: GameOneVsOnePageComponent;
    let fixture: ComponentFixture<GameOneVsOnePageComponent>;
    let gameCardServiceSpy: jasmine.SpyObj<GameCardService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let counterServiceSpy: jasmine.SpyObj<CounterService>;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;

    let mockSocket: jasmine.SpyObj<Socket>;
    // let mockRouter: Router;
    // let mockSocketService: jasmine.SpyObj<SocketService>;

    beforeEach(async () => {
        gameCardServiceSpy = jasmine.createSpyObj('GameCardService', ['removePlayer']);
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['initOneVsOneComponents', 'soloGame', 'initializeGame']);
        counterServiceSpy = jasmine.createSpyObj('CounterService', [], { count: 0 });
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getGameNames']);

        mockSocket = jasmine.createSpyObj<Socket>(['on', 'emit']);
        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.emit.and.returnValue(mockSocket);

        await TestBed.configureTestingModule({
            declarations: [GameOneVsOnePageComponent],
            imports: [HttpClientModule, MatDialogModule],
            providers: [
                { provide: GameCardService, useValue: gameCardServiceSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: CounterService, useValue: counterServiceSpy },
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: CounterService, useValue: { counter: 0, counter2: 0 } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameOneVsOnePageComponent);
        component = fixture.componentInstance;

        socketServiceSpy.socket = mockSocket;
        fixture.detectChanges();
    });

    /*
    afterEach(() => {
        fixture = TestBed.createComponent(GameOneVsOnePageComponent);
        component = fixture.componentInstance;
        // mockSocketService.socket = mockSocket;
    });
    */
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should call removePlayer method of GameCardService with correct arguments and set showPopup to false', () => {
        component.gameTitle = 'test-game-title';
        component.userName = 'test-user-name';
        component.showPopup = true;
        gameCardServiceSpy.removePlayer.and.returnValue(of(undefined));

        component.returnToMainMenu();

        expect(gameCardServiceSpy.removePlayer).toHaveBeenCalledWith('test-game-title', 'test-user-name');
        expect(component.showPopup).toBe(false);
    });

    it('should return true for isPlayer1() if gameMaster and userName are equal in sessionStorage', () => {
        spyOn(sessionStorage, 'getItem').and.returnValue('test-user-name');
        expect(component.isPlayer1()).toBe(true);
    });

    it('should set isWinner and showPopup to true on player-quit-game event', () => {
        mockSocket.on.withArgs('player-quit-game', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback();
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('player-quit-game');

        expect(component.isWinner).toBeTrue();
        expect(component.showPopup).toBeTrue();
    });

    it('should set isWinner and showPopup to false on send-victorious-player event', () => {
        mockSocket.on.withArgs('send-victorious-player', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback();
            return mockSocket;
        });

        component.ngAfterViewInit();
        setTimeout(() => {
            mockSocket.emit('send-victorious-player');

            expect(component.isWinner).toBeFalse();
            expect(component.showPopup).toBeTrue();
        });
    });

    it('should set isWinner and showPopup to true on send-victorious-player event', () => {
        component.counterService.counter = 4;
        component.counterService.counter2 = 2;
        mockSocket.on.withArgs('send-victorious-player', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback();
            return mockSocket;
        });

        component.ngAfterViewInit();
        setTimeout(() => {
            mockSocket.emit('send-victorious-player');
            expect(component.isWinner).toBeTrue();
            expect(component.showPopup).toBeTrue();
        });
    });

    /*
    it('should call initCanvases() of playArea for startReplay()', () => {
        spyOn(component.playArea, 'initCanvases');

        component.startReplay();

        expect(component.playArea.initCanvases).toHaveBeenCalled();
    });
    */

    /*
    it('should call playAction() of replayService for test()', () => {
        spyOn(component.replayService, 'playAction');

        component.startReplay();
    });
    */
});
