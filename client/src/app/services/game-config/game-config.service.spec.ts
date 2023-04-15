import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameConfigService } from './game-config.service';

describe('GameConfigService', () => {
    let service: GameConfigService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GameConfigService],
        });
        service = TestBed.inject(GameConfigService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get countdown time', () => {
        const countdownTime = 30;

        service.getCountdownTime().subscribe((response) => {
            expect(response).toBe(countdownTime);
        });

        const req = httpMock.expectOne(`${service.baseUrl}/gameConfig/constants/countdownTime`);
        expect(req.request.method).toBe('GET');
        req.flush(countdownTime);
    });

    it('should set countdown time', () => {
        const countdownTime = 20;

        service.setCountdownTime(countdownTime).subscribe((response) => {
            expect(response).toBe(null);
        });

        const req = httpMock.expectOne(`${service.baseUrl}/gameConfig/constants/countdownTime`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body.time).toBe(countdownTime);
        req.flush(null);
    });

    it('should get penalty time', () => {
        const penaltyTime = 5;

        service.getPenaltyTime().subscribe((response) => {
            expect(response).toBe(penaltyTime);
        });

        const req = httpMock.expectOne(`${service.baseUrl}/gameConfig/constants/penaltyTime`);
        expect(req.request.method).toBe('GET');
        req.flush(penaltyTime);
    });

    it('should set penalty time', () => {
        const penaltyTime = 10;

        service.setPenaltyTime(penaltyTime).subscribe((response) => {
            expect(response).toBe(null);
        });

        const req = httpMock.expectOne(`${service.baseUrl}/gameConfig/constants/penaltyTime`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body.time).toBe(penaltyTime);
        req.flush(null);
    });

    it('should get time gained', () => {
        const timeGained = 5;

        service.getTimeGained().subscribe((response) => {
            expect(response).toBe(timeGained);
        });

        const req = httpMock.expectOne(`${service.baseUrl}/gameConfig/constants/timeGained`);
        expect(req.request.method).toBe('GET');
        req.flush(timeGained);
    });

    it('should set time gained', () => {
        const timeGained = 10;

        service.setTimeGained(timeGained).subscribe((response) => {
            expect(response).toBe(null);
        });

        const req = httpMock.expectOne(`${service.baseUrl}/gameConfig/constants/timeGained`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body.time).toBe(timeGained);
        req.flush(null);
    });
});
