import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';
import { of } from 'rxjs';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    let communicationSpy: jasmine.SpyObj<CommunicationService>;
    let gameCardServiceSpy: jasmine.SpyObj<GameCardService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(async () => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        communicationSpy = jasmine.createSpyObj('CommunicationService', ['getGameAvailability']);
        gameCardServiceSpy = jasmine.createSpyObj('GameCardService', ['addPlayer', 'getPlayers']);
        component = new GameCardComponent(dialogSpy, communicationSpy, socketServiceSpy, gameCardServiceSpy);
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, HttpClientModule],
            declarations: [GameCardComponent],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: CommunicationService, useValue: communicationSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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
        const storageSpy = spyOn(localStorage, 'setItem');
        component.userName = 'John Doe';
        component.gameTitle = 'Tic Tac Toe';
        component.difficulty = true;
        component.saveUserName();
        expect(storageSpy).toHaveBeenCalledWith('userName', 'John Doe');
        expect(storageSpy).toHaveBeenCalledWith('gameTitle', 'Tic Tac Toe');
        expect(storageSpy).toHaveBeenCalledWith('difficulty', 'Difficile');
    });

    it('should save the user name and game title without difficulty', () => {
        const storageSpy = spyOn(localStorage, 'setItem');
        component.userName = 'Jane Doe';
        component.gameTitle = 'Checkers';
        component.difficulty = false;
        component.saveUserName();
        expect(storageSpy).toHaveBeenCalledWith('userName', 'Jane Doe');
        expect(storageSpy).toHaveBeenCalledWith('gameTitle', 'Checkers');
        expect(storageSpy).toHaveBeenCalledWith('difficulty', 'Facile');
    });

    it('should open the namePopupTemplate dialog if the game is available', fakeAsync(() => {
        communicationSpy.getGameAvailability.and.returnValue(of(true));
        // component.openSettings();
        tick();
        expect(dialogSpy.open).toHaveBeenCalledWith(component.namePopupTemplate, { width: '400px' });
    }));

    it('should open the namePopupTemplate1vs1 dialog if the game is available', fakeAsync(() => {
        communicationSpy.getGameAvailability.and.returnValue(of(true));
        // component.openSettings();
        tick();
        expect(dialogSpy.open).toHaveBeenCalledWith(component.namePopupTemplate1vs1, { width: '400px' });
    }));

    it('should open the notAvailableTemplate dialog and reload the page if the game is not available', fakeAsync(() => {
        communicationSpy.getGameAvailability.and.returnValue(of(false));
        const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRef.afterClosed.and.returnValue(of(undefined));
        dialogSpy.open.and.returnValue(dialogRef);

        spyOn(component, 'reloadPage');

        // component.openSettings();
        tick();
        expect(dialogSpy.open).toHaveBeenCalledWith(component.notAvailableTemplate, { width: '400px' });
        expect(component.reloadPage).toHaveBeenCalled();
    }));
});
