import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSelectionPageComponent } from './game-selection-page-component.component';

describe('GameSelectionPageComponent', () => {
    let component: GameSelectionPageComponent;
    let fixture: ComponentFixture<GameSelectionPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameSelectionPageComponent],
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
        expect(component.displayedGames.length).toEqual(4);
        expect(component.displayedGames[0].title).toEqual('Game 1');
        expect(component.displayedGames[3].title).toEqual('Game 4');

        component.currentPage = 1;
        expect(component.displayedGames.length).toEqual(4);
        expect(component.displayedGames[0].title).toEqual('Game 5');
        expect(component.displayedGames[3].title).toEqual('Game 8');
    });

    it('should find the last page correctly', () => {
        expect(component.lastPage).toEqual(2);
    });
    it('should change currentPage on back', () => {
        component.currentPage = 1;
        component.onBack();
        expect(component.currentPage).toEqual(0);
    });

    it('should change currentPage on next', () => {
        component.currentPage = 1;
        component.onNext();
        expect(component.currentPage).toEqual(2);
    });
});
