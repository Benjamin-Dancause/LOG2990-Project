import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Gamecard } from '@app/classes/gamecard';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import { ConfigPageComponent } from './config-page-component.component';

const PAGE_SIZE = 4;

describe('ConfigPageComponent', () => {
    let component: ConfigPageComponent;
    let fixture: ComponentFixture<ConfigPageComponent>;
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

    const communicationService = jasmine.createSpyObj<CommunicationService>('CommunicationService', ['getAvailableGames']);

    beforeEach(async () => {
        communicationService.getAvailableGames.and.returnValue(of(gamecards));

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [ConfigPageComponent],
            providers: [{ provide: CommunicationService, useValue: communicationService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigPageComponent);
        component = fixture.componentInstance;
        component.games = gamecards;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.currentPage).toBe(0);
        expect(component.pageSize).toBe(PAGE_SIZE);
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
