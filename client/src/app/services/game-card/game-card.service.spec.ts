import { TestBed } from '@angular/core/testing';
import { GameCardService } from './game-card.service';

describe('TimerService', () => {
    let service: GameCardService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GameCardService],
        });
        service = TestBed.inject(GameCardService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
