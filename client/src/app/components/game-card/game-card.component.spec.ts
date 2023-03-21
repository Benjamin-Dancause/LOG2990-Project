/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';
import { of } from 'rxjs';
import { GameCardComponent } from './game-card.component';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let communicationSpy: jasmine.SpyObj<CommunicationService>;
    // let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(async () => {
        const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);
        const communicationSpyObj = jasmine.createSpyObj('CommunicationService', ['getGameAvailability', 'deleteGame']);
        const gameCardServiceSpyObj = jasmine.createSpyObj('GameCardService', ['getPlayers']);
        const socketServiceSpyObj = jasmine.createSpyObj('SocketService', ['on']);

        await TestBed.configureTestingModule({
            declarations: [GameCardComponent],
            providers: [
                { provide: MatDialog, useValue: dialogSpyObj },
                { provide: CommunicationService, useValue: communicationSpyObj },
                { provide: SocketService, useValue: socketServiceSpyObj },
                { provide: GameCardService, useValue: gameCardServiceSpyObj },
            ],
        }).compileComponents();

        dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        communicationSpy = TestBed.inject(CommunicationService) as jasmine.SpyObj<CommunicationService>;
        // socketServiceSpy = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        // gameCardServiceSpy = TestBed.inject(GameCardService) as jasmine.SpyObj<GameCardService>;

        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        component.gameTitle = 'game1';
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

    it('should return top 3 best solo times', () => {
        const topThreeBestSoloTimes = component.topThreeBestTimesSolo;
        expect(topThreeBestSoloTimes.length).toBe(3);
    });

    it('should return top 3 best 1vs1 times', () => {
        const topThreeBest1vs1Times = component.topThreeBestTimesOneVsOne;
        expect(topThreeBest1vs1Times.length).toBe(3);
    });

    it('should save the user name, game title, and difficulty', () => {
        const storageSpy = spyOn(sessionStorage, 'setItem');
        component.userName = 'John Doe';
        component.gameTitle = 'Tic Tac Toe';
        component.difficulty = true;
        component.saveUserName();
        expect(storageSpy).toHaveBeenCalledWith('userName', 'John Doe');
        expect(storageSpy).toHaveBeenCalledWith('gameTitle', 'Tic Tac Toe');
        expect(storageSpy).toHaveBeenCalledWith('difficulty', 'Difficile');
    });

    it('should save the user name and game title without difficulty', () => {
        const storageSpy = spyOn(sessionStorage, 'setItem');
        component.userName = 'Jane Doe';
        component.gameTitle = 'Checkers';
        component.difficulty = false;
        component.saveUserName();
        expect(storageSpy).toHaveBeenCalledWith('userName', 'Jane Doe');
        expect(storageSpy).toHaveBeenCalledWith('gameTitle', 'Checkers');
        expect(storageSpy).toHaveBeenCalledWith('difficulty', 'Facile');
    });

    describe('openSettingsSolo', () => {
        it('should open the namePopupTemplate if the game is available', () => {
            communicationSpy.getGameAvailability.and.returnValue(of(true));

            component.openSettingsSolo();

            expect(sessionStorage.getItem('gameMode')).toBe('solo');
            expect(dialogSpy.open).toHaveBeenCalledWith(component.namePopupTemplate, {
                width: '400px',
            });
        });

        it('should open the notAvailableTemplate if the game is not available', () => {
            communicationSpy.getGameAvailability.and.returnValue(of(false));

            component.openSettingsSolo();

            expect(sessionStorage.getItem('gameMode')).toBe('solo');
            expect(dialogSpy.open).toHaveBeenCalledWith(component.notAvailableTemplate, {
                width: '400px',
            });
        });
    });

    describe('openSettings1vs1', () => {
        it('should open the namePopupTemplate1vs1 if the game is available', () => {
            communicationSpy.getGameAvailability.and.returnValue(of(true));

            component.openSettings1vs1();

            expect(sessionStorage.getItem('gameMode')).toBe('1v1');
            expect(dialogSpy.open).toHaveBeenCalledWith(component.namePopupTemplate1vs1, {
                width: '400px',
            });
        });

        it('should open the notAvailableTemplate if the game is not available', () => {
            communicationSpy.getGameAvailability.and.returnValue(of(false));

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
});
