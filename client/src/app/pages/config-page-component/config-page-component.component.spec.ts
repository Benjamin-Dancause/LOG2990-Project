import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Gamecard } from '@app/classes/gamecard';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HomeButtonComponent } from '@app/components/home-button/home-button.component';
import { PreviousNextButtonComponent } from '@app/components/previous-next-button/previous-next-button.component';
import { SettingsButtonComponent } from '@app/components/settings-button/settings-button.component';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import { ConfigPageComponent } from './config-page-component.component';

const PAGE_SIZE = 4;

describe('ConfigPageComponent', () => {
    let component: ConfigPageComponent;
    let fixture: ComponentFixture<ConfigPageComponent>;
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

    const communicationService = jasmine.createSpyObj<CommunicationService>('CommunicationService', ['getAllGames']);

    beforeEach(async () => {
        communicationService.getAllGames.and.returnValue(of(gamecards));

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatDialogModule, RouterTestingModule],
            declarations: [ConfigPageComponent, GameCardComponent, PreviousNextButtonComponent, HomeButtonComponent, SettingsButtonComponent],
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
});
