import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigPageComponent } from './config-page-component.component';

const PAGE_SIZE = 4;

describe('ConfigPageComponent', () => {
    let component: ConfigPageComponent;
    let fixture: ComponentFixture<ConfigPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfigPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display first 4 games on first page', () => {
        expect(component.displayedGames.length).toBe(PAGE_SIZE);
        expect(component.displayedGames[0].title).toBe('Game 1');
        expect(component.displayedGames[3].title).toBe('Game 4');
    });

    it('should change to next page on clicking next', () => {
        component.onNext();
        expect(component.displayedGames.length).toBe(PAGE_SIZE);
        expect(component.displayedGames[0].title).toBe('Game 5');
        expect(component.displayedGames[3].title).toBe('Game 8');
    });

    it('should change to previous page on clicking back', () => {
        component.onNext();
        component.onBack();
        expect(component.displayedGames.length).toBe(PAGE_SIZE);
        expect(component.displayedGames[0].title).toBe('Game 1');
        expect(component.displayedGames[3].title).toBe('Game 4');
    });

    it('should not change to previous page if already on first page', () => {
        component.onBack();
        expect(component.displayedGames.length).toBe(PAGE_SIZE);
        expect(component.displayedGames[0].title).toBe('Game 1');
        expect(component.displayedGames[3].title).toBe('Game 4');
    });

    it('should not change to next page if already on last page', () => {
        component.onNext();
        component.onNext();
        component.onNext();
        component.onNext();
        expect(component.displayedGames.length).toBe(3);
        expect(component.displayedGames[0].title).toBe('Game 9');
        expect(component.displayedGames[2].title).toBe('Game 11');
    });
});
