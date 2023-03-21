import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommunicationService } from '@app/services/communication/communication.service';
import { CounterService } from '@app/services/counter/counter.service';
import { GameService } from '@app/services/game/game.service';
import { SocketService } from '@app/services/socket/socket.service';
import { OneVsOneGameplayInfo } from '@common/game-interfaces';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { PlayAreaComponent } from './play-area.component';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let mockCommunicationService: jasmine.SpyObj<CommunicationService>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockCounterService: jasmine.SpyObj<CounterService>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockSessionStorage: any = {};
    let mockSocket: jasmine.SpyObj<Socket>;

    beforeEach(async () => {
        mockSocketService = jasmine.createSpyObj<SocketService>(['sendDifferenceFound', 'initOneVsOneComponents', 'assignPlayerInfo']);
        mockCommunicationService = jasmine.createSpyObj<CommunicationService>(['getGameByName']);
        mockGameService = jasmine.createSpyObj<GameService>(['setGameName', 'getContexts', 'cheatMode', 'clearContexts', 'clearDifferenceArray']);
        mockCounterService = jasmine.createSpyObj<CounterService>(['incrementCounter']);
        mockSocket = jasmine.createSpyObj<Socket>(['emit', 'on']);
        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.emit.and.returnValue(mockSocket);
        mockCommunicationService.getGameByName.and.returnValue(
            of({ images: ['image1.png', 'image1.png'], name: 'name1', count: 3, difficulty: true }),
        );
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [RouterTestingModule, HttpClientModule],
            providers: [
                { provide: SocketService, useValue: mockSocketService },
                { provide: CommunicationService, useValue: mockCommunicationService },
                { provide: CounterService, useValue: mockCounterService },
                { provide: GameService, useValue: mockGameService },
            ],
        }).compileComponents();

        mockSessionStorage = {};

        spyOn(sessionStorage, 'getItem').and.callFake((key: string): string => {
            return mockSessionStorage[key] || null;
        });

        spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string): void => {
            mockSessionStorage[key] = value;
        });

        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        mockCommunicationService = TestBed.inject(CommunicationService) as jasmine.SpyObj<CommunicationService>;
        mockSocketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        mockGameService = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        mockSocketService.socket = mockSocket;
        mockCounterService = TestBed.inject(CounterService) as jasmine.SpyObj<CounterService>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should listen to player-info event and set player1 and call initOneVsOneComponents', () => {
        const gameplayInfo: OneVsOneGameplayInfo = {
            gameTitle: 'game',
            roomId: '1234',
            player1: false,
        };

        mockSocket.on.withArgs('player-info', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(gameplayInfo);
            return mockSocket;
        });

        component.ngAfterViewInit();
        component.socketService.socket.emit('player-info', gameplayInfo);

        expect(component.player1).toBeFalse();
        expect(component.socketService.initOneVsOneComponents).toHaveBeenCalledWith(component.player1);
        expect(component.socketService.socket.on).toHaveBeenCalledWith('player-info', jasmine.any(Function));
    });

    it('should call ', () => {
        mockSessionStorage['gameMode'] = '1v1';
        component.gameName = 'game1';
        component.ngAfterViewInit();

        expect(component.socketService.assignPlayerInfo).toHaveBeenCalledWith('game1');
    });

    it('should check the mouse click', () => {});
});
