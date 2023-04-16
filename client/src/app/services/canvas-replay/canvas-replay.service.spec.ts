import { TestBed } from '@angular/core/testing';

import { CanvasReplayService } from './canvas-replay.service';

describe('CanvasReplayService', () => {
    let service: CanvasReplayService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasReplayService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
