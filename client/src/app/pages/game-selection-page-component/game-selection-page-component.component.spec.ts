import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Gamecard } from '@app/classes/gamecard';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { HomeButtonComponent } from '@app/components/home-button/home-button.component';
import { PreviousNextButtonComponent } from '@app/components/previous-next-button/previous-next-button.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SocketService } from '@app/services/socket/socket.service';
import { of } from 'rxjs';
import { GameSelectionPageComponent } from './game-selection-page-component.component';

const PAGE_SIZE = 4;

describe('GameSelectionPageComponent', () => {
    let component: GameSelectionPageComponent;
    let fixture: ComponentFixture<GameSelectionPageComponent>;
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

    let communicationService: jasmine.SpyObj<CommunicationService>;
    let socketService: jasmine.SpyObj<SocketService>;

    beforeEach(async () => {
        communicationService = jasmine.createSpyObj<CommunicationService>('CommunicationService', ['getAllGames']);
        socketService = jasmine.createSpyObj('SocketService', ['disconnectSocket']);

        communicationService.getAllGames.and.returnValue(of(gamecards));
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        socketService.disconnectSocket.and.callFake(() => {});

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatDialogModule],
            declarations: [GameSelectionPageComponent, GameCardComponent, PreviousNextButtonComponent, HomeButtonComponent],
            providers: [{ provide: CommunicationService, useValue: communicationService }],
        }).compileComponents();

        socketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        fixture = TestBed.createComponent(GameSelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display correct games', () => {
        component.currentPage = 0;
        expect(component.displayedGames.length).toEqual(PAGE_SIZE);
        expect(component.displayedGames[0].name).toEqual('Game 1');
        expect(component.displayedGames[3].name).toEqual('Game 4');

        component.currentPage = 1;
        expect(component.displayedGames.length).toEqual(PAGE_SIZE);
        expect(component.displayedGames[0].name).toEqual('Game 5');
        expect(component.displayedGames[3].name).toEqual('Game 8');
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

    it('should disconnect socket when disconnectSocket is called', () => {
        spyOn(component.socketService, 'disconnectSocket');
        component.disconnectSocket();
        expect(component.socketService.disconnectSocket).toHaveBeenCalled();
    });
});
