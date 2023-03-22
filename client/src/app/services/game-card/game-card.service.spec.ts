import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { GameCardService } from './game-card.service';

describe('GameCardService', () => {
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

    it('should send a POST request to the server when calling addPlayer()', () => {
        const gameTitle = 'test1';
        const userName = 'player';
        const url = `${environment.serverUrl}/gameCards/${gameTitle}/players`;
        service.addPlayer(gameTitle, userName).subscribe();
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual({ userName });
        req.flush({});
    });

    it('should send a DELETE request to the server when calling removePlayer()', () => {
        const gameTitle = 'test1';
        const userName = 'player';
        const url = `${environment.serverUrl}/gameCards/${gameTitle}/players/${userName}`;
        service.removePlayer(gameTitle, userName).subscribe();
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('DELETE');
        req.flush({});
    });

    it('should send a GET request to the server when calling getPlayers()', () => {
        const gameTitle = 'test1';
        const players = ['player', 'joiner'];
        const url = `${environment.serverUrl}/gameCards/${gameTitle}/players`;
        service.getPlayers(gameTitle).subscribe((result) => {
            expect(result).toEqual(players);
        });
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('GET');
        req.flush(players);
    });
});
