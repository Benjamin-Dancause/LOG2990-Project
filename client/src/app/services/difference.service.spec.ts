import { TestBed } from '@angular/core/testing';

import { DifferenceService } from './difference.service';

describe('DifferenceService', () => {
    let service: DifferenceService;

    beforeEach(() => {
        setupHTML();
        TestBed.configureTestingModule({});
        service = TestBed.inject(DifferenceService);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    const setupHTML = () => {
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.width = 640;
        canvas.height = 480;
        canvas.setAttribute('id', 'canvas1');
        document.body.appendChild(canvas);

        const canvas2 = document.createElement('canvas') as HTMLCanvasElement;
        canvas2.width = 640;
        canvas2.height = 480;
        canvas2.setAttribute('id', 'canvas2');
        document.body.appendChild(canvas2);
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
        const canvas1 = document.getElementById('canvas1') as HTMLCanvasElement;
        const canvas2 = document.getElementById('canvas2') as HTMLCanvasElement;
        const ctx1 = canvas1.getContext('2d');
        ctx1?.fillRect(0, 0, 10, 10);
        const ctx2 = canvas2.getContext('2d');
        const diff = service.findDifference(ctx1 as CanvasRenderingContext2D, ctx2 as CanvasRenderingContext2D, 0);
        expect(service.countDifference(diff)).toEqual(1);
    });

    it('should return 2 when there is only 2 difference', () => {
        const canvas1 = document.getElementById('canvas1') as HTMLCanvasElement;
        const canvas2 = document.getElementById('canvas2') as HTMLCanvasElement;
        const ctx1 = canvas1.getContext('2d');
        ctx1?.fillRect(0, 0, 10, 10);
        ctx1?.fillRect(40, 40, 10, 10);
        const ctx2 = canvas2.getContext('2d');
        const diff = service.findDifference(ctx1 as CanvasRenderingContext2D, ctx2 as CanvasRenderingContext2D, 1);
        expect(service.countDifference(diff)).toEqual(2);
    });

    it('should return 0 when there is no difference', () => {
        const canvas1 = document.getElementById('canvas1') as HTMLCanvasElement;
        const canvas2 = document.getElementById('canvas2') as HTMLCanvasElement;
        const ctx1 = canvas1.getContext('2d');
        const ctx2 = canvas2.getContext('2d');
        const diff = service.findDifference(ctx1 as CanvasRenderingContext2D, ctx2 as CanvasRenderingContext2D, 1);
        expect(service.countDifference(diff)).toEqual(0);
    });

    it('should return 1 when 2 differences are close', () => {
        const canvas1 = document.getElementById('canvas1') as HTMLCanvasElement;
        const canvas2 = document.getElementById('canvas2') as HTMLCanvasElement;
        const ctx1 = canvas1.getContext('2d');
        ctx1?.fillRect(0, 0, 10, 10);
        ctx1?.fillRect(12, 0, 10, 10);
        const ctx2 = canvas2.getContext('2d');
        const diff = service.findDifference(ctx1 as CanvasRenderingContext2D, ctx2 as CanvasRenderingContext2D, 5);
        expect(service.countDifference(diff)).toEqual(1);
    });

    it("should throw an error when the canvas context can't be loaded", () => {
        const canvas1 = document.getElementById('canvas1') as HTMLCanvasElement;
        const ctx1 = canvas1.getContext('2d');
        const ctx2 = null as unknown;
        expect(() => service.findDifference(ctx1 as CanvasRenderingContext2D, ctx2 as CanvasRenderingContext2D, 5)).toThrow(
            new Error("Un des canvas n'a pas été chargé correctement"),
        );
    });
});
