import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Gamecard } from '@app/classes/gamecard';
import { GameSelectionPageComponent } from './game-selection-page-component.component';

const PAGE_SIZE = 4;

describe('GameSelectionPageComponent', () => {
    let component: GameSelectionPageComponent;
    let fixture: ComponentFixture<GameSelectionPageComponent>;
    const gamecards: Gamecard[] = [
        { title: 'Game 1', image: 'image1', level: 'easy', configuration: true },
        { title: 'Game 2', image: 'image2', level: 'medium', configuration: true },
        { title: 'Game 3', image: 'image3', level: 'hard', configuration: true },
        { title: 'Game 4', image: 'image4', level: 'easy', configuration: true },
        { title: 'Game 5', image: 'image5', level: 'medium', configuration: true },
        { title: 'Game 6', image: 'image6', level: 'hard', configuration: true },
        { title: 'Game 7', image: 'image7', level: 'easy', configuration: true },
        { title: 'Game 8', image: 'image8', level: 'medium', configuration: true },
        { title: 'Game 9', image: 'image9', level: 'hard', configuration: true },
        { title: 'Game 10', image: 'image10', level: 'easy', configuration: true },
        { title: 'Game 11', image: 'image11', level: 'medium', configuration: true },
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [GameSelectionPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameSelectionPageComponent);
        component = fixture.componentInstance;
        component.games = gamecards;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display correct games', () => {
        component.currentPage = 0;
        expect(component.displayedGames.length).toEqual(PAGE_SIZE);
        expect(component.displayedGames[0].title).toEqual('Game 1');
        expect(component.displayedGames[3].title).toEqual('Game 4');

        component.currentPage = 1;
        expect(component.displayedGames.length).toEqual(PAGE_SIZE);
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
        component.onNext();
        expect(component.currentPage).toEqual(1);
    });
});
