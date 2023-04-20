/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
// eslint-disable-next-line no-restricted-imports
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { HistoryDialogComponent } from '../history-dialog/history-dialog.component';
import { GameCardComponent } from './game-card.component';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let mockCommunicationService: jasmine.SpyObj<CommunicationService>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockGameCardService: jasmine.SpyObj<GameCardService>;
    let mockSocket: jasmine.SpyObj<Socket>;
    const mockSessionStorage: any = {};
    let mockLocation: jasmine.SpyObj<Location>;

    beforeEach(async () => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        mockCommunicationService = jasmine.createSpyObj('CommunicationService', [
            'getGameAvailability',
            'deleteGame',
            'resetBestTimes',
            'getGameHistory',
            'deleteGameHistory',
        ]);
        mockGameCardService = jasmine.createSpyObj('GameCardService', ['getPlayers', 'addPlayer']);
        mockGameCardService.addPlayer.and.returnValue(of(null));
        mockGameCardService.getPlayers.and.returnValue(of(['null']));
        mockSocketService = jasmine.createSpyObj('SocketService', ['deleteGame']);
        mockSocket = jasmine.createSpyObj<Socket>(['on', 'emit']);
        mockLocation = jasmine.createSpyObj('Location', ['reload']);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        mockLocation.reload.and.callFake(() => {});
        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.emit.and.returnValue(mockSocket);
        mockGameCardService.addPlayer.and.returnValue(of(null));
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: CommunicationService, useValue: mockCommunicationService },
                { provide: SocketService, useValue: mockSocketService },
                { provide: GameCardService, useValue: mockGameCardService },
                { provide: Location, useValue: mockLocation },
                { provide: MatDialog, useValue: dialogSpy },
            ],
        }).compileComponents();

        spyOn(sessionStorage, 'getItem').and.callFake((key: string): string => {
            return mockSessionStorage[key] || null;
        });

        spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string): void => {
            mockSessionStorage[key] = value;
        });

        dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        mockCommunicationService = TestBed.inject(CommunicationService) as jasmine.SpyObj<CommunicationService>;
        mockSocketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        mockGameCardService = TestBed.inject(GameCardService) as jasmine.SpyObj<GameCardService>;

        fixture = TestBed.createComponent(GameCardComponent);
        mockSocketService.socket = mockSocket;
        component = fixture.componentInstance;
        component.gameTitle = 'game1';

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        spyOn(component, 'reloadPage').and.callFake(() => {});
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return green color when difficulty is set to easy', () => {
        component.difficulty = false;
        expect(component.color).toBe('green');
    });

    it('should return red color when difficulty is set to hard', () => {
        component.difficulty = true;
        expect(component.color).toBe('red');
    });

    it('should set difficulty to easy and return Facile as difficultyText', () => {
        component.difficulty = false;
        expect(component.levelText).toBe('Facile');
    });

    it('should set difficulty to hard and return Difficile as difficultyText', () => {
        component.difficulty = true;
        expect(component.levelText).toBe('Difficile');
    });

    it('should save the user name, game title, and difficulty', () => {
        component.userName = 'John Doe';
        component.gameTitle = 'Tic Tac Toe';
        component.difficulty = true;
        component.saveUserName();
        expect(mockSessionStorage['userName']).toBe('John Doe');
        expect(mockSessionStorage['gameTitle']).toBe('Tic Tac Toe');
        expect(mockSessionStorage['difficulty']).toBe('Difficile');
    });

    it('should save the user name and game title without difficulty', () => {
        component.userName = 'Jane Doe';
        component.gameTitle = 'Checkers';
        component.difficulty = false;
        component.saveUserName();
        expect(mockSessionStorage['userName']).toBe('Jane Doe');
        expect(mockSessionStorage['gameTitle']).toBe('Checkers');
        expect(mockSessionStorage['difficulty']).toBe('Facile');
    });

    it('should call gameCardService.addPlayer with userName and gameTitle if gameMode is solo', () => {
        mockSessionStorage['gameMode'] = 'solo';
        component.userName = 'Jane Doe';
        component.gameTitle = 'Checkers';
        component.difficulty = false;
        component.saveUserName();
        expect(mockGameCardService.addPlayer).toHaveBeenCalledWith('Checkers', 'Jane Doe');
    });

    describe('openSettingsSolo', () => {
        it('should open the namePopupTemplate if the game is available', () => {
            mockCommunicationService.getGameAvailability.and.returnValue(of(true));

            component.openSettingsSolo();

            expect(sessionStorage.getItem('gameMode')).toBe('solo');
            expect(dialogSpy.open).toHaveBeenCalledWith(component.namePopupTemplate, {
                width: '400px',
            });
        });

        it('should open the notAvailableTemplate if the game is not available', () => {
            mockCommunicationService.getGameAvailability.and.returnValue(of(false));

            component.openSettingsSolo();

            expect(sessionStorage.getItem('gameMode')).toBe('solo');
            expect(dialogSpy.open).toHaveBeenCalledWith(component.notAvailableTemplate, {
                width: '400px',
            });
        });
    });

    describe('openSettings1vs1', () => {
        it('should open the namePopupTemplate1vs1 if the game is available', () => {
            mockCommunicationService.getGameAvailability.and.returnValue(of(true));

            component.openSettings1vs1();

            expect(sessionStorage.getItem('gameMode')).toBe('1v1');
            expect(dialogSpy.open).toHaveBeenCalledWith(component.namePopupTemplate1vs1, {
                width: '400px',
            });
        });

        it('should open the notAvailableTemplate if the game is not available', () => {
            mockCommunicationService.getGameAvailability.and.returnValue(of(false));

            component.openSettings1vs1();

            expect(sessionStorage.getItem('gameMode')).toBe('1v1');
            expect(dialogSpy.open).toHaveBeenCalledWith(component.notAvailableTemplate, {
                width: '400px',
            });
        });
    });

    describe('ngOnInit', () => {
        it('should call buttonUpdating if configuration is not set', () => {
            spyOn(component, 'buttonUpdating');
            component.configuration = false;
            component.ngOnInit();
            expect(component.buttonUpdating).toHaveBeenCalled();
        });

        it('should not call buttonUpdating if configuration is set', () => {
            spyOn(component, 'buttonUpdating');
            component.configuration = true;
            component.ngOnInit();
            expect(component.buttonUpdating).not.toHaveBeenCalled();
        });
    });

    describe('ngAfterViewInit', () => {
        it('should call buttonUpdating if configuration is not set', () => {
            spyOn(component, 'buttonUpdating');
            component.configuration = false;
            component.ngAfterViewInit();
            expect(component.buttonUpdating).toHaveBeenCalled();
        });

        it('should not call buttonUpdating if configuration is set', () => {
            spyOn(component, 'buttonUpdating');
            component.configuration = true;
            component.ngAfterViewInit();
            expect(component.buttonUpdating).not.toHaveBeenCalled();
        });
    });

    it('should set createButton to false if awaiting-lobby event is received and component has same gameTitle as emitted one', () => {
        component.gameTitle = 'game1';
        const gameTitle = 'game1';

        mockSocket.on.withArgs('awaiting-lobby', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(gameTitle);
            return mockSocket;
        });

        component.buttonUpdating();
        mockSocket.emit('awaiting-lobby', gameTitle);

        expect(component.createButton).toBeFalse();
    });

    it('should set createButton to true if completed-lobby event is received and component has same gameTitle as emitted one', () => {
        component.gameTitle = 'game1';
        const gameTitle = 'game1';

        mockSocket.on.withArgs('completed-lobby', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(gameTitle);
            return mockSocket;
        });

        component.buttonUpdating();
        mockSocket.emit('completed-lobby', gameTitle);

        expect(component.createButton).toBeTrue();
    });

    it('should set createButton to true if completed-lobby event is received and component has same gameTitle as emitted one', fakeAsync(() => {
        const players: string[] = [];
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
        mockGameCardService.getPlayers.and.returnValue(of(players));
        dialogSpy.open.and.returnValue(dialogRefSpy);
        dialogRefSpy.afterClosed.and.returnValue(of('yes'));
        mockCommunicationService.deleteGame.and.returnValue(of(null));
        component.deleteGame('game1');
        tick();
        expect(dialogSpy.open).toHaveBeenCalled();
        expect(dialogSpy.open.calls.mostRecent().args[0]).toEqual(ConfirmationDialogComponent);
        expect(mockCommunicationService.deleteGame).toHaveBeenCalledWith('game1');
        expect(mockSocketService.deleteGame).toHaveBeenCalledWith('game1');
        expect(component.reloadPage).toHaveBeenCalled();
    }));

    it('convertTime should return a string with the correct format', () => {
        const time = 610;
        const result = component.convertTime(time);
        expect(result).toEqual('10:10');
    });

    it('convertTime should return a string with the correct format', () => {
        const time = 1;
        const result = component.convertTime(time);
        expect(result).toEqual('00:01');
    });

    it('timesSolo getter should return the correct value', () => {
        const bestTimes = {
            name: 'game1',
            usersSolo: ['user1', 'user2', 'user3'],
            usersMulti: ['user1', 'user2', 'user3'],
            timesSolo: [100, 200, 300],
            timesMulti: [100, 200, 300],
        };
        component.bestTimes = bestTimes;
        expect(component.timesSolo).toEqual(bestTimes.timesSolo);
    });

    it('should reset the best times when confirmed', fakeAsync(() => {
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of('yes'));

        dialogSpy.open.and.returnValue(dialogRefSpy);

        component.resetBestTimes('gameTitle');
        tick();

        expect(dialogSpy.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
            data: {
                title: 'Confirmation',
                message: 'Êtes-vous sûr de vouloir réinitialiser les meilleurs temps ?',
            },
        });

        expect(mockCommunicationService.resetBestTimes).toHaveBeenCalledWith('gameTitle');
        expect(component.reloadPage).toHaveBeenCalled();
    }));

    it('should open history dialog and reset game history when dialog returns "reset"', fakeAsync(() => {
        const gameHistory: any[] = [];
        mockCommunicationService.getGameHistory.and.returnValue(of(gameHistory));
        const dialogMock = {
            afterClosed: () => of('reset'),
        };
        dialogSpy.open.and.returnValue(dialogMock as any);

        component.gameTitle = 'gameTitle';
        component.gameHistory();
        tick();

        expect(mockCommunicationService.getGameHistory).toHaveBeenCalledWith('gameTitle');

        expect(dialogSpy.open).toHaveBeenCalledWith(HistoryDialogComponent, {
            data: {
                title: 'gameTitle - Historique des parties',
                history: gameHistory,
                global: false,
            },
        });

        tick();

        expect(mockCommunicationService.deleteGameHistory).toHaveBeenCalled();
    }));
});
