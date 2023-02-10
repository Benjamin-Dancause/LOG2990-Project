import { TestBed } from '@angular/core/testing';

import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ARRAY_OFFSET, CANVAS_HEIGHT, CANVAS_WIDTH, DifferenceService } from './difference.service';

describe('DifferenceService', () => {
    let service: DifferenceService;
    let ctxStub1: CanvasRenderingContext2D;
    let ctxStub2: CanvasRenderingContext2D;
    const TEST_VALUE1 = 5;
    const TEST_VALUE2 = 10;
    const TEST_VALUE3 = 40;

    beforeEach(() => {
        setupHTML();
        TestBed.configureTestingModule({});
        service = TestBed.inject(DifferenceService);
    });

    const setupHTML = () => {
        ctxStub1 = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        ctxStub2 = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
    };
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should return coordinate [0, 0] when i = 0', () => {
        expect(service.findXY(0)).toEqual([0, 0]);
    });

    it('should return coordinate [1, 0] when i = 4', () => {
        expect(service.findXY(ARRAY_OFFSET)).toEqual([1, 0]);
    });

    it('should return coordinate [0, 1] when i = 2560', () => {
        expect(service.findXY(ARRAY_OFFSET * CANVAS_WIDTH)).toEqual([0, 1]);
    });

    it('should return coordinate [1, 1] when i = 2564', () => {
        expect(service.findXY(ARRAY_OFFSET * CANVAS_WIDTH + ARRAY_OFFSET)).toEqual([1, 1]);
    });
    it('should return 1 when there is only 1 difference', () => {
        ctxStub1?.fillRect(0, 0, TEST_VALUE2, TEST_VALUE2);
        const diff = service.findDifference(ctxStub1, ctxStub2, 0);
        expect(service.countDifference(diff)).toEqual(1);
    });

    it('should return 2 when there is only 2 difference', () => {
        ctxStub1?.fillRect(0, 0, TEST_VALUE2, TEST_VALUE2);
        ctxStub2?.fillRect(TEST_VALUE3, TEST_VALUE3, TEST_VALUE2, TEST_VALUE2);
        const diff = service.findDifference(ctxStub1, ctxStub2, 1);
        expect(service.countDifference(diff)).toEqual(2);
    });

    it('should return 0 when there is no difference', () => {
        const diff = service.findDifference(ctxStub1, ctxStub2, 1);
        expect(service.countDifference(diff)).toEqual(0);
    });

    it('should return 1 when 2 differences are close', () => {
        ctxStub1?.fillRect(0, 0, TEST_VALUE2, TEST_VALUE2);
        ctxStub1?.fillRect(TEST_VALUE2, 0, TEST_VALUE2, TEST_VALUE2);
        const diff = service.findDifference(ctxStub1, ctxStub2, TEST_VALUE1);
        expect(service.countDifference(diff)).toEqual(1);
    });
});
