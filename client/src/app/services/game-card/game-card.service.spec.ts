import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameCardService } from './game-card.service';

fdescribe('GameCardService', () => {
    let service: GameCardService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GameCardService],
        });
        service = TestBed.inject(GameCardService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add a player to a game', () => {
        const gameTitle = 'Test Game';
        const userName = 'Test User';
        service.addPlayer(gameTitle, userName).subscribe((response) => {
            expect(response).toBeTruthy();
        });
        const request = httpMock.expectOne(`${service.baseUrl}/gameCards/${gameTitle}/players`);
        expect(request.request.method).toBe('POST');
        request.flush({});
    });

    it('should remove a player from a game', () => {
        const gameTitle = 'Test Game';
        const userName = 'Test User';
        service.removePlayer(gameTitle, userName).subscribe((response) => {
            expect(response).toBeTruthy();
        });
        const request = httpMock.expectOne(`${service.baseUrl}/gameCards/${gameTitle}/players/${userName}`);
        expect(request.request.method).toBe('DELETE');
        request.flush({});
    });

    it('should get the list of players for a game', () => {
        const gameTitle = 'Test Game';
        const players = ['Player 1', 'Player 2', 'Player 3'];
        service.getPlayers(gameTitle).subscribe((response) => {
            expect(response).toEqual(players);
        });
        const request = httpMock.expectOne(`${service.baseUrl}/gameCards/${gameTitle}/players`);
        expect(request.request.method).toBe('GET');
        request.flush(players);
    });
});
