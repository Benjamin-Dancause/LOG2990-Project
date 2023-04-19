import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication/communication.service';
import { CounterService } from '@app/services/counter/counter.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';
import { of } from 'rxjs';
import { LimitedTimePageComponent } from './limited-time-page.component';

describe('LimitedTimePageComponent', () => {
    let component: LimitedTimePageComponent;
    let fixture: ComponentFixture<LimitedTimePageComponent>;
    let gameCardServiceSpy: jasmine.SpyObj<GameCardService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let counterServiceSpy: jasmine.SpyObj<CounterService>;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;

    beforeEach(() => {
        gameCardServiceSpy = jasmine.createSpyObj('GameCardService', ['removePlayer']);
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['initOneVsOneComponents', 'soloGame', 'initializeGame']);
        counterServiceSpy = jasmine.createSpyObj('CounterService', [], { count: 0 });
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getGameNames']);

        TestBed.configureTestingModule({
            declarations: [LimitedTimePageComponent],
            providers: [
                { provide: GameCardService, useValue: gameCardServiceSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: CounterService, useValue: counterServiceSpy },
                { provide: CommunicationService, useValue: communicationServiceSpy },
            ],
        });

        fixture = TestBed.createComponent(LimitedTimePageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call communicationService.getGameNames and shuffle the games before calling socketService.initializeGame', () => {
            spyOn(sessionStorage, 'getItem').and.returnValues('gameTitle', 'userName', 'gameMode');
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
