import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { CounterService } from '@app/services/counter/counter.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { GameOneVsOnePageComponent } from './game-one-vs-one-page.component';

describe('GamePageOneVsOneComponent', () => {
    let component: GameOneVsOnePageComponent;
    let fixture: ComponentFixture<GameOneVsOnePageComponent>;
    let gameCardService: jasmine.SpyObj<GameCardService>;
    let counterService: CounterService;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockSessionStorage: any = {};
    let mockSocket: jasmine.SpyObj<Socket>;

    beforeEach(async () => {
        mockSocketService = jasmine.createSpyObj<SocketService>(['soloGame']);
        gameCardService = jasmine.createSpyObj<GameCardService>(['removePlayer']);

        mockSocket = jasmine.createSpyObj<Socket>(['on', 'emit']);
        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.emit.and.returnValue(mockSocket);

        await TestBed.configureTestingModule({
            declarations: [GameOneVsOnePageComponent],
            imports: [HttpClientModule, MatDialogModule],
            providers: [{ provide: SocketService, useValue: mockSocketService },
                        { provide: GameCardService, useValue: gameCardService },
                        { provide: CounterService, useValue: {counter: 0, counter2: 0} }]
        }).compileComponents();

        mockSessionStorage = {};

        spyOn(sessionStorage, 'getItem').and.callFake((key: string): string => {
            return mockSessionStorage[key] || null;
        });

    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameOneVsOnePageComponent);
        counterService = TestBed.inject(CounterService);
        component = fixture.componentInstance;
        mockSocketService.socket = mockSocket;
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

    it('should set showPopup to true when the current player wins', () => {
        const player1 = true;
        mockSessionStorage['userName'] = 'player1';
        mockSessionStorage['gameMaster'] = 'player2';
        mockSessionStorage['joiningPlayer'] = 'player1';
        counterService.counter = 4;
        counterService.counter2 = 2;

        mockSocket.on.withArgs('send-victorious-player', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(player1);
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('send-victorious-player', player1);
        expect(component.isWinner).toBeTrue();
        expect(component.winningPlayer).toBe('player1');
        expect(component.showPopup).toBeTrue();
    });

    it('should set showPopup to true when the opponent wins and set the correct name if the game master won', () => {
        const player1 = true;
        mockSessionStorage['userName'] = 'player1';
        mockSessionStorage['gameMaster'] = 'player2';
        mockSessionStorage['joiningPlayer'] = 'player1';
        counterService.counter = 2;
        counterService.counter2 = 4;

        mockSocket.on.withArgs('send-victorious-player', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(player1);
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('send-victorious-player', player1);
        expect(component.isWinner).toBeFalse();
        expect(component.winningPlayer).toBe('player2');
        expect(component.showPopup).toBeTrue();
    });

    it('should set showPopup to true when the opponent wins and set the correct name if the joining player won', () => {
        const player1 = false;
        mockSessionStorage['userName'] = 'player1';
        mockSessionStorage['gameMaster'] = 'player1';
        mockSessionStorage['joiningPlayer'] = 'player2';
        counterService.counter = 2;
        counterService.counter2 = 4;

        mockSocket.on.withArgs('send-victorious-player', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(player1);
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('send-victorious-player', player1);
        expect(component.isWinner).toBeFalse();
        expect(component.winningPlayer).toBe('player2');
        expect(component.showPopup).toBeTrue();
    });

    it('should set showPopup to true when the opponent quits and set the winner to the remaining player', () => {
        mockSessionStorage['userName'] = 'player1';
        mockSessionStorage['gameMaster'] = 'player2';
        mockSessionStorage['joiningPlayer'] = 'player1';

        mockSocket.on.withArgs('player-quit-game', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback();
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('player-quit-game');
        expect(component.isWinner).toBeTrue();
        expect(component.winningPlayer).toBe('player1');
        expect(component.showPopup).toBeTrue();
    });

    it('should set isPlayer1 to true if the names match', () => {
        mockSessionStorage['userName'] = 'player1';
        mockSessionStorage['gameMaster'] = 'player1';

        const player1 = component.isPlayer1();

        expect(player1).toBeTrue();
    });

    it('should set isPlayer1 to false if the names do not match', () => {
        mockSessionStorage['userName'] = 'player1';
        mockSessionStorage['gameMaster'] = 'player2';

        const player1 = component.isPlayer1();

        expect(player1).toBeFalse();
    });
});
