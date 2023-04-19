import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Gamecard } from '@app/classes/gamecard';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HomeButtonComponent } from '@app/components/home-button/home-button.component';
import { PreviousNextButtonComponent } from '@app/components/previous-next-button/previous-next-button.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SocketService } from '@app/services/socket/socket.service';
import { BEST_TIME } from '@common/constants';
import { bestTimes } from '@common/game-interfaces';
import { of } from 'rxjs';
import { GameSelectionPageComponent } from './game-selection-page-component.component';

const PAGE_SIZE = 4;

describe('GameSelectionPageComponent', () => {
    let component: GameSelectionPageComponent;
    let fixture: ComponentFixture<GameSelectionPageComponent>;
    const gamecards: Gamecard[] = [
        { name: 'Game 1', image: 'image1', difficulty: false, configuration: true },
        { name: 'Game 2', image: 'image2', difficulty: false, configuration: true },
        { name: 'Game 3', image: 'image3', difficulty: true, configuration: true },
        { name: 'Game 4', image: 'image4', difficulty: false, configuration: true },
        { name: 'Game 5', image: 'image5', difficulty: false, configuration: true },
        { name: 'Game 6', image: 'image6', difficulty: true, configuration: true },
        { name: 'Game 7', image: 'image7', difficulty: false, configuration: true },
        { name: 'Game 8', image: 'image8', difficulty: false, configuration: true },
        { name: 'Game 9', image: 'image9', difficulty: true, configuration: true },
        { name: 'Game 10', image: 'image10', difficulty: false, configuration: true },
        { name: 'Game 11', image: 'image11', difficulty: false, configuration: true },
    ];

    const bestTimes: bestTimes[] = [
        {
            name: 'Game 1',
            usersSolo: ['player1', 'player2', 'player3'],
            usersMulti: ['player4', 'player5', 'player6'],
            timesSolo: [BEST_TIME.WORST_SOLO_TIME, BEST_TIME.SOLO_TIME, BEST_TIME.BEST_SOLO_TIME],
            timesMulti: [BEST_TIME.WORST_MULTI_TIME, BEST_TIME.MULTI_TIME, BEST_TIME.BEST_MULTI_TIME],
        },
        {
            name: 'Game 2',
            usersSolo: ['player1', 'player2', 'player3'],
            usersMulti: ['player4', 'player5', 'player6'],
            timesSolo: [BEST_TIME.WORST_SOLO_TIME, BEST_TIME.SOLO_TIME, BEST_TIME.BEST_SOLO_TIME],
            timesMulti: [BEST_TIME.WORST_MULTI_TIME, BEST_TIME.MULTI_TIME, BEST_TIME.BEST_MULTI_TIME],
        },
        {
            name: 'Game 3',
            usersSolo: ['player1', 'player2', 'player3'],
            usersMulti: ['player4', 'player5', 'player6'],
            timesSolo: [BEST_TIME.WORST_SOLO_TIME, BEST_TIME.SOLO_TIME, BEST_TIME.BEST_SOLO_TIME],
            timesMulti: [BEST_TIME.WORST_MULTI_TIME, BEST_TIME.MULTI_TIME, BEST_TIME.BEST_MULTI_TIME],
        },
        {
            name: 'Game 4',
            usersSolo: ['player1', 'player2', 'player3'],
            usersMulti: ['player4', 'player5', 'player6'],
            timesSolo: [BEST_TIME.WORST_SOLO_TIME, BEST_TIME.SOLO_TIME, BEST_TIME.BEST_SOLO_TIME],
            timesMulti: [BEST_TIME.WORST_MULTI_TIME, BEST_TIME.MULTI_TIME, BEST_TIME.BEST_MULTI_TIME],
        },
        {
            name: 'Game 5',
            usersSolo: ['player1', 'player2', 'player3'],
            usersMulti: ['player4', 'player5', 'player6'],
            timesSolo: [BEST_TIME.WORST_SOLO_TIME, BEST_TIME.SOLO_TIME, BEST_TIME.BEST_SOLO_TIME],
            timesMulti: [BEST_TIME.WORST_MULTI_TIME, BEST_TIME.MULTI_TIME, BEST_TIME.BEST_MULTI_TIME],
        },
        {
            name: 'Game 6',
            usersSolo: ['player1', 'player2', 'player3'],
            usersMulti: ['player4', 'player5', 'player6'],
            timesSolo: [BEST_TIME.WORST_SOLO_TIME, BEST_TIME.SOLO_TIME, BEST_TIME.BEST_SOLO_TIME],
            timesMulti: [BEST_TIME.WORST_MULTI_TIME, BEST_TIME.MULTI_TIME, BEST_TIME.BEST_MULTI_TIME],
        },
        {
            name: 'Game 7',
            usersSolo: ['player1', 'player2', 'player3'],
            usersMulti: ['player4', 'player5', 'player6'],
            timesSolo: [BEST_TIME.WORST_SOLO_TIME, BEST_TIME.SOLO_TIME, BEST_TIME.BEST_SOLO_TIME],
            timesMulti: [BEST_TIME.WORST_MULTI_TIME, BEST_TIME.MULTI_TIME, BEST_TIME.BEST_MULTI_TIME],
        },
        {
            name: 'Game 8',
            usersSolo: ['player1', 'player2', 'player3'],
            usersMulti: ['player4', 'player5', 'player6'],
            timesSolo: [BEST_TIME.WORST_SOLO_TIME, BEST_TIME.SOLO_TIME, BEST_TIME.BEST_SOLO_TIME],
            timesMulti: [BEST_TIME.WORST_MULTI_TIME, BEST_TIME.MULTI_TIME, BEST_TIME.BEST_MULTI_TIME],
        },
        {
            name: 'Game 9',
            usersSolo: ['player1', 'player2', 'player3'],
            usersMulti: ['player4', 'player5', 'player6'],
            timesSolo: [BEST_TIME.WORST_SOLO_TIME, BEST_TIME.SOLO_TIME, BEST_TIME.BEST_SOLO_TIME],
            timesMulti: [BEST_TIME.WORST_MULTI_TIME, BEST_TIME.MULTI_TIME, BEST_TIME.BEST_MULTI_TIME],
        },
        {
            name: 'Game 10',
            usersSolo: ['player1', 'player2', 'player3'],
            usersMulti: ['player4', 'player5', 'player6'],
            timesSolo: [BEST_TIME.WORST_SOLO_TIME, BEST_TIME.SOLO_TIME, BEST_TIME.BEST_SOLO_TIME],
            timesMulti: [BEST_TIME.WORST_MULTI_TIME, BEST_TIME.MULTI_TIME, BEST_TIME.BEST_MULTI_TIME],
        },
        {
            name: 'Game 11',
            usersSolo: ['player1', 'player2', 'player3'],
            usersMulti: ['player4', 'player5', 'player6'],
            timesSolo: [BEST_TIME.WORST_SOLO_TIME, BEST_TIME.SOLO_TIME, BEST_TIME.BEST_SOLO_TIME],
            timesMulti: [BEST_TIME.WORST_MULTI_TIME, BEST_TIME.MULTI_TIME, BEST_TIME.BEST_MULTI_TIME],
        },
    ];

    let communicationService: jasmine.SpyObj<CommunicationService>;
    let socketService: jasmine.SpyObj<SocketService>;

    beforeEach(async () => {
        communicationService = jasmine.createSpyObj<CommunicationService>('CommunicationService', ['getAllGames', 'getAllBestTimes']);
        socketService = jasmine.createSpyObj('SocketService', ['disconnectSocket', 'initializeSocket']);

        communicationService.getAllGames.and.returnValue(of(gamecards));
        communicationService.getAllBestTimes.and.returnValue(of(bestTimes));
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        socketService.disconnectSocket.and.callFake(() => {});

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatDialogModule],
            declarations: [GameSelectionPageComponent, GameCardComponent, PreviousNextButtonComponent, HomeButtonComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationService },
                { provide: SocketService, useValue: socketService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameSelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display correct games', () => {
        component.currentPage = 0;
        expect(component.displayedGames.length).toEqual(PAGE_SIZE);
        expect(component.displayedGames[0].name).toEqual('Game 1');
        expect(component.displayedGames[3].name).toEqual('Game 4');

        component.currentPage = 1;
        expect(component.displayedGames.length).toEqual(PAGE_SIZE);
        expect(component.displayedGames[0].name).toEqual('Game 5');
        expect(component.displayedGames[3].name).toEqual('Game 8');
    });
    it('should change currentPage on next', () => {
        component.onNext();
        expect(component.currentPage).toEqual(1);
    });

    it('should disconnect socket when disconnectSocket is called', () => {
        component.disconnectSocket();
        expect(component.socketService.disconnectSocket).toHaveBeenCalled();
    });
    it('should not display the previous page of games on back button click when on first page', () => {
        component.onBack();
        fixture.detectChanges();
        expect(component.displayedGames).toEqual(gamecards.slice(0, PAGE_SIZE));
    });

    it('should fill bestTimes variable on creation for the right game', fakeAsync(() => {
        tick();
        fixture.detectChanges();
        expect(component.bestTimes).toEqual(bestTimes);
    }));

    it('should decrement currentPages if onBack is called and value is over 0', () => {
        component.currentPage = 1;
        component.onBack();
        fixture.detectChanges();
        expect(component.currentPage).toEqual(0);
    });
});
