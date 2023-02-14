import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Coords } from '@app/classes/coords';
import { Gamecard } from '@app/classes/gamecard';
import { GameplayData, GameSelectionPageData } from '@app/components/create-image/create-image.component';
import { CommunicationService, DifferenceInterface } from '@app/services/communication.service';
import { Message } from '@common/message';

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return expected message (HttpClient called once)', () => {
        const expectedMessage: Message = { body: 'Hello', title: 'World' };
        // check the content of the mocked call
        service.basicGet().subscribe({
            next: (response: Message) => {
                expect(response.title).toEqual(expectedMessage.title);
                expect(response.body).toEqual(expectedMessage.body);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/example`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedMessage);
    });

    it('should not return any message when sending a POST request (HttpClient called once)', () => {
        const sentMessage: Message = { body: 'Hello', title: 'World' };
        // subscribe to the mocked call
        service.basicPost(sentMessage).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/example/send`);
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(sentMessage);
    });

    it('should handle http error safely', () => {
        service.basicGet().subscribe({
            next: (response: Message) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/example`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('should return a message when sending a GET request (HttpClient called once)', () => {
        const returnedMessage: Message = { body: 'Hello', title: 'World' };
        // subscribe to the mocked call
        service.basicGet().subscribe({
            next: (message: Message) => {
                expect(message).toEqual(returnedMessage);
            },
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/example`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(returnedMessage);
    });
    it('should return a list of game names (HttpClient called once)', () => {
        const expectedGameNames: string[] = ['Game 1', 'Game 2', 'Game 3'];
        service.getGameNames().subscribe({
            next: (response) => {
                expect(response).toEqual(expectedGameNames);
            },
        });
        const req = httpMock.expectOne(`${baseUrl}/games/names`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedGameNames);
    });
    it('should send a POST request to /games/images and return an HttpResponse<string>', () => {
        const request = { data: 'image data' };
        const mockResponse = 'OK';
        const url = `${service['baseUrl']}/games/images`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service.imagesPost(request).subscribe((response: any) => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect(response.status).toBe(200);
            expect(response.body).toBe(mockResponse);
        });

        const req = httpMock.expectOne(url);
        expect(req.request.method).toBe('POST');

        req.flush(mockResponse, { status: 200, statusText: 'OK' });
    });

    it('should return an observable of GameSelectionPageData[]', () => {
        const mockResponse: GameSelectionPageData[] = [
            { image: 'image 1', name: 'Game 1', difficulty: false },
            { image: 'image 2', name: 'Game 2', difficulty: false },
        ];

        service.getAllGames().subscribe((response) => {
            expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/games/allGames`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should retrieve gameplay data by game name', () => {
        const name = 'test-game';
        const expectedData: GameplayData = {
            name: 'test',
            images: ['image 1', 'image 2'],
            count: 4,
            difficulty: false,
        };

        service.getGameByName(name).subscribe((data) => {
            expect(data).toEqual(expectedData);
        });

        const req = httpMock.expectOne(`${baseUrl}/games/gameByName`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ name });
        req.flush(expectedData);
    });

    it('should return an array of Gamecard objects', () => {
        const expectedGames: Gamecard[] = [
            { name: 'Game 1', image: 'image 1', difficulty: false, configuration: false },
            { name: 'Game 2', image: 'image 2', difficulty: true, configuration: false },
            { name: 'Game 3', image: 'image 3', difficulty: false, configuration: false },
        ];

        service.getAvailableGames().subscribe((games: Gamecard[]) => {
            expect(games.length).toBe(3);
            expect(games).toEqual(expectedGames);
        });

        const req = httpMock.expectOne(`${service['baseUrl']}/games/all`);
        expect(req.request.method).toEqual('GET');

        req.flush(expectedGames);
    });

    it('should send position and return difference', () => {
        const id = 123;
        const coords: Coords = { x: 10, y: 20 };
        const difference: DifferenceInterface = {
            isDifference: false,
            differenceNumber: 5,
            coords: [
                { x: 200, y: 471 },
                { x: 199, y: 472 },
            ],
        };

        service.sendPosition(id, coords).subscribe((data) => {
            expect(data).toEqual(difference);
        });

        const req = httpMock.expectOne(`${service['baseUrl']}/gaming/find`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ id, coords });

        req.flush(difference);
    });

    it('should create a game by name and return its id', () => {
        const expectedId = 123;
        const name = 'test-game';

        service.createGameByName(name).subscribe((id: number) => {
            expect(id).toBe(expectedId);
        });

        const req = httpMock.expectOne(`${baseUrl}/gaming/new`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ name });

        req.flush(expectedId);
    });
});
