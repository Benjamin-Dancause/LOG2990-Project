import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';

import { DrawingService } from './drawing.service';

describe('DrawingService', () => {
    let service: DrawingService;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    beforeEach(() => {
        setupHTML();
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
    });
    const setupHTML = () => {
        canvas = CanvasTestHelper.createCanvas(640, 480);
        ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    };
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should register drawing canvases', () => {
        spyOn(service, 'register').and.callThrough();
        service.register(canvas);
        expect(service.canvasRegistry.length).toEqual(1);
        expect(service.undo.length).toEqual(0);
        expect(service.redo.length).toEqual(0);
    });
    it('should register drawing canvases', () => {
        spyOn(service, 'registerBackground').and.callThrough();
        service.registerBackground(canvas);
        expect(service.backgroundRegistry.length).toEqual(1);
    });
    it('should set the current tool', () => {
        spyOn(service, 'setTool').and.callThrough();
        const tool = 'pen';
        service.setTool(tool);
        expect(service.currentTool).toEqual(tool);
    });
    it('should set the radius', () => {
        spyOn(service, 'setRadius').and.callThrough();
        const radius = 5;
        service.setRadius(radius);
        expect(service.currentRadius).toEqual(radius);
    });
    it('should set the active canvas and get the right context', () => {
        spyOn(service, 'setActiveCanvas').and.callThrough();
        service.setActiveCanvas(canvas);
        expect(service.currentCanvas).toBe(canvas);
        expect(service.currentCtx).toBe(ctx);
    });
});
