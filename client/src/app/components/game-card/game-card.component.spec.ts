import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { GameCardComponent } from '@app/components/game-card/game-card.component';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [GameCardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return green color when level is set to easy', () => {
        component.level = 'easy';
        expect(component.color).toBe('green');
    });

    it('should return red color when level is set to hard', () => {
        component.level = 'hard';
        expect(component.color).toBe('red');
    });

    it('should return yellow color when level is set to medium', () => {
        component.level = 'medium';
        expect(component.color).toBe('yellow');
    });

    it('should set level to easy and return Facile as levelText', () => {
        component.level = 'easy';
        expect(component.levelText).toBe('Facile');
    });

    it('should set level to hard and return Difficile as levelText', () => {
        component.level = 'hard';
        expect(component.levelText).toBe('Difficile');
    });

    it('should set level to medium and return Moyen levelText', () => {
        component.level = 'medium';
        expect(component.levelText).toBe('Moyen');
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
});
