import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { GameCardComponent } from '@app/components/game-card/game-card.component';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, HttpClientModule],
            providers: [HttpClient],
            declarations: [GameCardComponent],
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

    it('should open the settings name window', () => {
        spyOn(component.dialog, 'open');
        component.openSettings();
        expect(component.dialog.open).toHaveBeenCalled();
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
});
