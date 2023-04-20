import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { CommunicationService } from '@app/services/communication/communication.service';
import { CounterService } from '@app/services/counter/counter.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { LimitedTimePageComponent } from './limited-time-page.component';

describe('LimitedTimePageComponent', () => {
    let component: LimitedTimePageComponent;
    let fixture: ComponentFixture<LimitedTimePageComponent>;
    let gameCardServiceSpy: jasmine.SpyObj<GameCardService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let counterServiceSpy: jasmine.SpyObj<CounterService>;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockSessionStorage: any = {};
    let mockSocket: jasmine.SpyObj<Socket>;

    beforeEach(() => {
        gameCardServiceSpy = jasmine.createSpyObj('GameCardService', ['removePlayer']);
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['initOneVsOneComponents', 'soloGame', 'initializeGame', 'deleteRoomGameInfo']);
        counterServiceSpy = jasmine.createSpyObj('CounterService', [], { count: 0 });
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getGameNames']);
        mockSocket = jasmine.createSpyObj<Socket>(['on', 'emit']);
        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.emit.and.returnValue(mockSocket);

        TestBed.configureTestingModule({
            declarations: [LimitedTimePageComponent],
            imports: [HttpClientModule, MatDialogModule],
            providers: [
                { provide: GameCardService, useValue: gameCardServiceSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: CounterService, useValue: counterServiceSpy },
                { provide: CommunicationService, useValue: communicationServiceSpy },
            ],
        });

        spyOn(sessionStorage, 'getItem').and.callFake((key: string): string => {
            return mockSessionStorage[key] || null;
        });

        spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string): void => {
            mockSessionStorage[key] = value;
        });

        fixture = TestBed.createComponent(LimitedTimePageComponent);
        component = fixture.componentInstance;
        socketServiceSpy.socket = mockSocket;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call communicationService.getGameNames and shuffle the games before calling socketService.initializeGame', () => {
            communicationServiceSpy.getGameNames.and.returnValue(of(['game1', 'game2', 'game3']));
            spyOn(component, 'shuffleGames').and.returnValue(['game2', 'game1', 'game3']);
            component.ngOnInit();
            expect(communicationServiceSpy.getGameNames).toHaveBeenCalled();
            expect(component.shuffleGames).toHaveBeenCalledWith(['game1', 'game2', 'game3']);
            expect(socketServiceSpy.initializeGame).toHaveBeenCalledWith(['game2', 'game1', 'game3']);
        });
    });
    it('should shuffle the array of game names', () => {
        const names = ['game1', 'game2', 'game3', 'game4'];
        const shuffled = component.shuffleGames(names);

        expect(shuffled.length).toEqual(names.length);
        expect(shuffled).toContain('game1');
        expect(shuffled).toContain('game2');
        expect(shuffled).toContain('game3');
        expect(shuffled).toContain('game4');
        expect(shuffled).toEqual(names);
    });

    it('should call initOneVsOneComponents on onInit if there is a joiningPlayer', () => {
        mockSessionStorage['joiningPlayer'] = 'player2';
        socketServiceSpy.initOneVsOneComponents.and.callFake((player1: boolean, gameMode: string) => {});
        communicationServiceSpy.getGameNames.and.returnValue(of(['game1', 'game2', 'game3']));
        component.ngOnInit();
        expect(socketServiceSpy.initOneVsOneComponents).toHaveBeenCalled();
    });

    it('should set showPopup to true when socket emits "send-victorious-player"', () => {
        const player1 = true;
        mockSocket.on.withArgs('send-victorious-player', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(player1);
            return mockSocket;
        });

        component.ngAfterViewInit();
        mockSocket.emit('send-victorious-player', player1);
        expect(component.showPopup).toBeTrue();
    });

    it('should return an empty array if an empty array is passed as argument', () => {
        const names: string[] = [];
        const shuffled = component.shuffleGames(names);
        expect(shuffled).toEqual([]);
    });

    it('should return a one-element array if a one-element array is passed as argument', () => {
        const names = ['game1'];
        const shuffled = component.shuffleGames(names);
        expect(shuffled).toEqual(names);
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
});
