/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Gamecard } from '@app/classes/gamecard';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { HistoryDialogComponent } from '@app/components/history-dialog/history-dialog.component';
import { HomeButtonComponent } from '@app/components/home-button/home-button.component';
import { PreviousNextButtonComponent } from '@app/components/previous-next-button/previous-next-button.component';
import { SettingsButtonComponent } from '@app/components/settings-button/settings-button.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SocketService } from '@app/services/socket/socket.service';
import { BestTimes } from '@common/game-interfaces';
import { of } from 'rxjs';
import { ConfigPageComponent } from './config-page-component.component';

const PAGE_SIZE = 4;

describe('ConfigPageComponent', () => {
    let component: ConfigPageComponent;
    let fixture: ComponentFixture<ConfigPageComponent>;
    let socketService: SocketService;
    let communicationService: CommunicationService;

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

    const bestTime: BestTimes[] = [
        {
            name: 'Game 1',
            usersSolo: ['User A', 'User B'],
            usersMulti: ['User A', 'User B', 'User C'],
            timesSolo: [100, 120],
            timesMulti: [100, 120, 150],
        },
        {
            name: 'Game 2',
            usersSolo: ['User A', 'User B'],
            usersMulti: ['User A', 'User B', 'User C'],
            timesSolo: [200, 220],
            timesMulti: [200, 220, 250],
        },
    ];

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatDialogModule, RouterTestingModule],
            declarations: [ConfigPageComponent, HomeButtonComponent, SettingsButtonComponent, PreviousNextButtonComponent],
            providers: [
                {
                    provide: CommunicationService,
                    useValue: {
                        getAllGames: () => of(gamecards),
                        getAllBestTimes: () => of([bestTime]),
                        deleteAll: () => of([]),
                        resetAllBestTimes: () => of([]),
                        getGameAllHistory: () => of([]),
                        deleteGameHistory: () => of([]),
                    },
                },
                { provide: SocketService, useValue: { initializeSocket: () => {}, disconnectSocket: () => {} } },
                { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of('yes') }) } },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigPageComponent);
        component = fixture.componentInstance;
        communicationService = TestBed.inject(CommunicationService);
        socketService = TestBed.inject(SocketService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.currentPage).toBe(0);
        expect(component.pageSize).toBe(PAGE_SIZE);
    });

    it('should display first 4 games on first page', () => {
        expect(component.displayedGames.length).toBe(PAGE_SIZE);
        expect(component.displayedGames[0].name).toBe('Game 1');
        expect(component.displayedGames[3].name).toBe('Game 4');
    });

    it('should change to next page on clicking next', () => {
        component.onNext();
        expect(component.displayedGames.length).toBe(PAGE_SIZE);
        expect(component.displayedGames[0].name).toBe('Game 5');
        expect(component.displayedGames[3].name).toBe('Game 8');
    });

    it('should change to previous page on clicking back', () => {
        component.onNext();
        component.onBack();
        expect(component.displayedGames.length).toBe(PAGE_SIZE);
        expect(component.displayedGames[0].name).toBe('Game 1');
        expect(component.displayedGames[3].name).toBe('Game 4');
    });

    it('should not change to previous page if already on first page', () => {
        component.onBack();
        expect(component.displayedGames.length).toBe(PAGE_SIZE);
        expect(component.displayedGames[0].name).toBe('Game 1');
        expect(component.displayedGames[3].name).toBe('Game 4');
    });

    it('should not change to next page if already on last page', () => {
        component.onNext();
        component.onNext();
        component.onNext();
        component.onNext();
        expect(component.displayedGames.length).toBe(3);
        expect(component.displayedGames[0].name).toBe('Game 9');
        expect(component.displayedGames[2].name).toBe('Game 11');
    });

    it('should initialize lastPage and socket', () => {
        spyOn(socketService, 'initializeSocket');
        component.ngOnInit();
        expect(component.lastPage).toBe(2);
        expect(socketService.initializeSocket).toHaveBeenCalled();
    });

    it('should delete all games and reload the page if user confirms', fakeAsync(() => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of('yes') });
        const dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        const communicationSpy = spyOn(TestBed.inject(CommunicationService), 'deleteAll').and.returnValue(of({}));
        const reloadSpy = spyOn(component, 'reloadPage');
        component.deleteAll();
        expect(dialogSpy).toHaveBeenCalledWith(ConfirmationDialogComponent, {
            data: {
                title: 'Confirmation',
                message: 'Êtes-vous sûr de vouloir supprimer toutes les parties ?',
            },
        });

        dialogRefSpyObj.afterClosed.and.callFake(() => {
            tick();
            return of('yes');
        });

        expect(communicationSpy).toHaveBeenCalledWith();
        expect(reloadSpy).toHaveBeenCalled();
    }));

    it('should reset best times and reload page if confirmed', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of('yes') });
        const dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        const communicationSpy = spyOn(TestBed.inject(CommunicationService), 'resetAllBestTimes').and.returnValue();
        const reloadSpy = spyOn(component, 'reloadPage');
        component.resetBestTimes();

        expect(dialogSpy).toHaveBeenCalledWith(ConfirmationDialogComponent, {
            data: {
                title: 'Confirmation',
                message: 'Êtes-vous sûr de vouloir réinitialiser les meilleurs temps ?',
            },
        });

        dialogRefSpyObj.afterClosed.and.callFake(() => {
            tick();
            return of('yes');
        });

        expect(communicationSpy).toHaveBeenCalledWith();
        expect(reloadSpy).toHaveBeenCalled();
    });

    it('should open a dialog displaying all games history and delete history when reset is clicked', () => {
        const fakeHistory = [
            {
                gameTitle: 'Game 1',
                winner: 'player 1',
                loser: 'player 2',
                surrender: false,
                time: { startTime: '120', duration: 40 },
                isSolo: true,
                isLimitedTime: false,
            },
            {
                gameTitle: 'Game 2',
                winner: 'player 1',
                loser: 'player 2',
                surrender: false,
                time: { startTime: '120', duration: 40 },
                isSolo: true,
                isLimitedTime: false,
            },
        ];
        const getGameAllHistorySpy = spyOn(communicationService, 'getGameAllHistory').and.returnValue(of(fakeHistory));
        const deleteGameHistorySpy = spyOn(communicationService, 'deleteGameHistory').and.returnValue();
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of() });
        const dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);

        component.allGamesHistory();

        expect(getGameAllHistorySpy).toHaveBeenCalled();
        expect(dialogSpy).toHaveBeenCalledWith(HistoryDialogComponent, {
            data: {
                title: 'Historique des parties',
                history: fakeHistory,
                global: true,
            },
        });
        expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled();

        dialogRefSpyObj.afterClosed.and.returnValue(of('reset'));
        component.allGamesHistory();

        expect(deleteGameHistorySpy).toHaveBeenCalled();
    });
});
