import { TestBed } from '@angular/core/testing';

import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DifferenceService } from './difference.service';

describe('DifferenceService', () => {
    let service: DifferenceService;
    let ctxStub1: CanvasRenderingContext2D;
    let ctxStub2: CanvasRenderingContext2D;

    beforeEach(() => {
        setupHTML();
        TestBed.configureTestingModule({});
        service = TestBed.inject(DifferenceService);
    });

    const setupHTML = () => {
        ctxStub1 = CanvasTestHelper.createCanvas(640, 480).getContext('2d') as CanvasRenderingContext2D;
        ctxStub2 = CanvasTestHelper.createCanvas(640, 480).getContext('2d') as CanvasRenderingContext2D;
    };
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should return coordinate [0, 0] when i = 0', () => {
        expect(service.findXY(0)).toEqual([0, 0]);
    });

    it('should return coordinate [1, 0] when i = 4', () => {
        expect(service.findXY(4)).toEqual([1, 0]);
    });

    it('should return coordinate [0, 1] when i = 2560', () => {
        expect(service.findXY(2560)).toEqual([0, 1]);
    });

    it('should return coordinate [1, 1] when i = 2564', () => {
        expect(service.findXY(2564)).toEqual([1, 1]);
    });
    it('should return 1 when there is only 1 difference', () => {
        ctxStub1?.fillRect(0, 0, 10, 10);
        const diff = service.findDifference(ctxStub1, ctxStub2, 0);
        expect(service.countDifference(diff)).toEqual(1);
    });

    it('should return 2 when there is only 2 difference', () => {
        ctxStub1?.fillRect(0, 0, 10, 10);
        ctxStub2?.fillRect(40, 40, 10, 10);
        const diff = service.findDifference(ctxStub1, ctxStub2, 1);
        expect(service.countDifference(diff)).toEqual(2);
    });

    it('should return 0 when there is no difference', () => {
        const diff = service.findDifference(ctxStub1, ctxStub2, 1);
        expect(service.countDifference(diff)).toEqual(0);
    });

    it('should return 1 when 2 differences are close', () => {
        ctxStub1?.fillRect(0, 0, 10, 10);
        ctxStub1?.fillRect(12, 0, 10, 10);
        const diff = service.findDifference(ctxStub1, ctxStub2, 5);
        expect(service.countDifference(diff)).toEqual(1);
    });
});
