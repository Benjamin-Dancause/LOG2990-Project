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

    it('should return i = 4 when coodinates = [1, 0]', () => {
        expect(service.findI([1, 0])).toEqual(ARRAY_OFFSET);
    });

    it('should return i = 2560 when coodinates = [0, 1]', () => {
        expect(service.findI([0, 1])).toEqual(ARRAY_OFFSET * CANVAS_WIDTH);
    });

    it('should return i = 2564 when coodinates = [1, 1]', () => {
        expect(service.findI([1, 1])).toEqual(ARRAY_OFFSET * CANVAS_WIDTH + ARRAY_OFFSET);
    });

    it('should return i = 0 when coodinates = [0, 0]', () => {
        expect(service.findI([0, 0])).toEqual(0);
    });

    it('should return 1 when there is only 1 difference', () => {
        ctxStub1?.fillRect(0, 0, TEST_VALUE2, TEST_VALUE2);
        const data1 = ctxStub1?.getImageData(0, 0, 640, 480);
        const data2 = ctxStub2?.getImageData(0, 0, 640, 480);
        const diff = service.findDifference(data1, data2, 0);
        expect(service.getDifference(diff).count).toEqual(1);
    });

    it('should return 2 when there is only 2 difference', () => {
        ctxStub1?.fillRect(0, 0, TEST_VALUE2, TEST_VALUE2);
        ctxStub2?.fillRect(TEST_VALUE3, TEST_VALUE3, TEST_VALUE2, TEST_VALUE2);
        const data1 = ctxStub1?.getImageData(0, 0, 640, 480);
        const data2 = ctxStub2?.getImageData(0, 0, 640, 480);
        const diff = service.findDifference(data1, data2, 1);
        expect(service.getDifference(diff).count).toEqual(2);
    });

    it('should return 0 when there is no difference', () => {
        const data1 = ctxStub1?.getImageData(0, 0, 640, 480);
        const data2 = ctxStub2?.getImageData(0, 0, 640, 480);
        const diff = service.findDifference(data1, data2, 1);
        expect(service.getDifference(diff).count).toEqual(0);
    });

    it('should return 1 when 2 differences are close', () => {
        ctxStub1?.fillRect(0, 0, TEST_VALUE2, TEST_VALUE2);
        ctxStub1?.fillRect(TEST_VALUE2, 0, TEST_VALUE2, TEST_VALUE2);
        const data1 = ctxStub1?.getImageData(0, 0, 640, 480);
        const data2 = ctxStub2?.getImageData(0, 0, 640, 480);
        const diff = service.findDifference(data1, data2, TEST_VALUE1);
        expect(service.getDifference(diff).count).toEqual(1);
    });

    it('should return false when every pixel is different', () => {
        ctxStub1?.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const data1 = ctxStub1?.getImageData(0, 0, 640, 480);
        const data2 = ctxStub2?.getImageData(0, 0, 640, 480);
        const diff = service.findDifference(data1, data2, 0);
        expect(service.isDifficult(diff)).toEqual(false);
    });

    it('should return false when there is only one small difference', () => {
        ctxStub1?.fillRect(0, 0, TEST_VALUE2, TEST_VALUE2);
        const data1 = ctxStub1?.getImageData(0, 0, 640, 480);
        const data2 = ctxStub2?.getImageData(0, 0, 640, 480);
        const diff = service.findDifference(data1, data2, 0);
        expect(service.isDifficult(diff)).toEqual(false);
    });

    it('should return true when there are seven small differences', () => {
        ctxStub1?.fillRect(0, 0, 1, 1);
        ctxStub1?.fillRect(TEST_VALUE2, 0, 1, 1);
        ctxStub1?.fillRect(TEST_VALUE2 * 2, 0, 1, 1);
        ctxStub1?.fillRect(TEST_VALUE2 * 3, 0, 1, 1);
        ctxStub1?.fillRect(0, TEST_VALUE2, 1, 1);
        ctxStub1?.fillRect(0, TEST_VALUE2, 1, 1);
        ctxStub1?.fillRect(0, TEST_VALUE2, 1, 1);
        const data1 = ctxStub1?.getImageData(0, 0, 640, 480);
        const data2 = ctxStub2?.getImageData(0, 0, 640, 480);
        const diff = service.findDifference(data1, data2, 0);
        expect(service.isDifficult(diff)).toEqual(false);
    });
});
