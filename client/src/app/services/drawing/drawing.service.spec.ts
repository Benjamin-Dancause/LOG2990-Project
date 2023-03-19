import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';

import { DrawingService } from './drawing.service';

describe('DrawingService', () => {
    let service: DrawingService;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let otherCanvas: HTMLCanvasElement;
    let otherCtx: CanvasRenderingContext2D;
    beforeEach(() => {
        setupHTML();
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
    });
    const setupHTML = () => {
        canvas = CanvasTestHelper.createCanvas(1, 1);
        ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        otherCanvas = CanvasTestHelper.createCanvas(1, 1);
        otherCtx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        otherCtx.fillStyle = '#000000';
        otherCtx?.fillRect(1, 1, otherCanvas.width, otherCanvas.height);
    };
    afterEach(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        otherCtx.clearRect(0, 0, otherCanvas.width, otherCanvas.height);
    });
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
    it('should set the current color', () => {
        spyOn(service, 'setColor').and.callThrough();
        const color = '#1F1F1F';
        service.setColor(color);
        expect(service.currentColor).toEqual(color);
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
    it('should start an action on click', () => {
        service.canvasRegistry = [canvas, otherCanvas];
        service.backgroundRegistry = [canvas, otherCanvas];
        const event = new MouseEvent('mousedown', { clientX: 100, clientY: 200, button: 0 });
        spyOn(service, 'execute').and.callThrough();
        spyOn(service, 'draw');
        spyOn(service, 'setBackgroundCtx');
        service.start(event, canvas);
        expect(service.isDrawing).toBeTrue();
        expect(service.lastPos).toEqual({ x: event.offsetX, y: event.offsetY });
        expect(service.execute).toHaveBeenCalledWith(event);
    });
    it('should stop an action on mouseup', () => {
        service.currentCanvas = canvas;
        service.currentCtx = ctx;
        spyOn(service, 'printDrawing');
        spyOn(service, 'saveAction');
        spyOn(service.currentCtx, 'clearRect');
        service.isDrawing = true;
        service.end();
        expect(service.isDrawing).toBeFalse();
        expect(service.printDrawing).toHaveBeenCalled();
        expect(service.currentCtx.clearRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
        expect(service.saveAction).toHaveBeenCalled();
    });
    it('should not execute any action if isDrawing is false or the target canvas does not match', () => {
        spyOn(service, 'draw');
        spyOn(service, 'erase');
        spyOn(service, 'drawRectangle');
        service.currentTool = 'pen';
        const event = new MouseEvent('mousemove', { clientX: 150, clientY: 250, button: 0 });
        service.isDrawing = false;
        service.execute(event);
        expect(service.draw).not.toHaveBeenCalled();
        expect(service.erase).not.toHaveBeenCalled();
        expect(service.drawRectangle).not.toHaveBeenCalled();
    });
    it('should draw if clicked on canvas and current tool is pen', () => {
        spyOn(service, 'draw');
        spyOn(service, 'erase');
        spyOn(service, 'drawRectangle');
        const eventArgs = {
            clientX: 100,
            clientY: 200,
            target: canvas,
        };
        const event = eventArgs as any as MouseEvent;
        service.currentTool = 'pen';
        service.isDrawing = true;
        service.currentCanvas = canvas;
        service.execute(event);
        expect(service.draw).toHaveBeenCalledWith(event);
        expect(service.erase).not.toHaveBeenCalled();
        expect(service.drawRectangle).not.toHaveBeenCalled();
    });
    it('should erase if clicked on canvas and current tool is eraser', () => {
        spyOn(service, 'draw');
        spyOn(service, 'erase');
        spyOn(service, 'drawRectangle');
        const eventArgs = {
            clientX: 100,
            clientY: 200,
            target: canvas,
        };
        const event = eventArgs as any as MouseEvent;
        service.currentTool = 'eraser';
        service.isDrawing = true;
        service.currentCanvas = canvas;
        service.execute(event);
        expect(service.draw).not.toHaveBeenCalled();
        expect(service.erase).toHaveBeenCalledWith(event);
        expect(service.drawRectangle).not.toHaveBeenCalled();
    });
    it('should draw rectangle if clicked on canvas and current tool is rectangle', () => {
        spyOn(service, 'draw');
        spyOn(service, 'erase');
        spyOn(service, 'drawRectangle');
        const eventArgs = {
            clientX: 100,
            clientY: 200,
            target: canvas,
        };
        const event = eventArgs as any as MouseEvent;
        service.currentTool = 'rectangle';
        service.isDrawing = true;
        service.currentCanvas = canvas;
        service.execute(event);
        expect(service.draw).not.toHaveBeenCalled();
        expect(service.erase).not.toHaveBeenCalled();
        expect(service.drawRectangle).toHaveBeenCalledWith(event);
    });
    it('should default if clicked on canvas and current tool is not a tool', () => {
        spyOn(service, 'draw');
        spyOn(service, 'erase');
        spyOn(service, 'drawRectangle');
        const eventArgs = {
            clientX: 100,
            clientY: 200,
            target: canvas,
        };
        const event = eventArgs as any as MouseEvent;
        service.currentTool = 'test';
        service.isDrawing = true;
        service.currentCanvas = canvas;
        service.execute(event);
        expect(service.draw).not.toHaveBeenCalled();
        expect(service.erase).not.toHaveBeenCalled();
        expect(service.drawRectangle).not.toHaveBeenCalled();
    });
    it('should draw', () => {
        service.currentCtx = ctx;
        spyOn(service, 'draw').and.callThrough();
        spyOn(service.currentCtx, 'stroke').and.callThrough();
        const event = new MouseEvent('mousemove', { clientX: 150, clientY: 250, button: 0 });
        service.currentColor = 'red';
        service.lastPos = { x: 100, y: 200 };
        service.draw(event);
        expect(service.currentCtx.stroke).toHaveBeenCalled();
        expect(service.currentCtx.strokeStyle).toEqual('#ff0000');
        expect(service.lastPos.x).toEqual(150);
        expect(service.lastPos.y).toEqual(250);
    });
    it('should erase', () => {
        service.currentBackgroundCtx = ctx;
        spyOn(service, 'erase').and.callThrough();
        spyOn(service.currentBackgroundCtx, 'clearRect').and.callThrough();
        service.lastPos = { x: 100, y: 200 };
        service.currentRadius = 5;
        const event = new MouseEvent('mousemove', { clientX: 150, clientY: 250, buttons: 1 });
        service.erase(event);
        expect(service.currentBackgroundCtx.clearRect).toHaveBeenCalled();
        expect(service.lastPos.x).toEqual(150);
        expect(service.lastPos.y).toEqual(250);
    });
    it('should draw rectangle', () => {
        service.currentCtx = ctx;
        spyOn(service, 'drawRectangle').and.callThrough();
        spyOn(service.currentCtx, 'fillRect').and.callThrough();
        service.square = false;
        const event = new MouseEvent('mousemove', { clientX: 150, clientY: 250, button: 0 });
        service.lastPos = { x: 100, y: 200 };
        service.drawRectangle(event);
        expect(service.currentCtx.fillRect).toHaveBeenCalledWith(
            event.offsetX,
            event.offsetY,
            service.lastPos.x - event.offsetX,
            service.lastPos.y - event.offsetY,
        );
    });
    it('should draw a square', () => {
        service.currentCtx = ctx;
        spyOn(service, 'drawRectangle').and.callThrough();
        spyOn(service.currentCtx, 'fillRect').and.callThrough();
        service.square = true;
        const event = new MouseEvent('mousemove', { clientX: 150, clientY: 250, button: 0 });
        service.lastPos = { x: 100, y: 200 };
        const width = event.offsetX - service.lastPos.x;
        const height = event.offsetY - service.lastPos.y;
        const size = Math.min(width, height);
        service.drawRectangle(event);
        expect(service.currentCtx.fillRect).toHaveBeenCalledWith(service.lastPos.x, service.lastPos.y, size, size);
    });
    it('square should become true', () => {
        spyOn(service, 'isSquare').and.callThrough();
        service.isSquare();
        expect(service.square).toBeTruthy();
    });
    it('square should become true', () => {
        spyOn(service, 'notSquare').and.callThrough();
        service.notSquare();
        expect(service.square).toBeFalsy();
    });
    it('should swap drawings', () => {
        spyOn(service, 'swapDrawings').and.callThrough();
        spyOn(service, 'saveAction').and.callThrough();
        const data = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        const otherData = otherCtx?.getImageData(0, 0, otherCanvas.width, otherCanvas.height);
        service.backgroundRegistry = [canvas, otherCanvas];
        service.swapDrawings();
        const result = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const otherResult = otherCtx?.getImageData(0, 0, otherCanvas.width, otherCanvas.height);
        expect(result).toEqual(otherData);
        expect(otherResult).toEqual(data);
        expect(service.saveAction).toHaveBeenCalled();
    });
    it('should copy left on right', () => {
        spyOn(service, 'copyLeftOnRight').and.callThrough();
        spyOn(service, 'saveAction').and.callThrough();
        const data = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        service.backgroundRegistry = [canvas, otherCanvas];
        service.copyLeftOnRight();
        const otherResult = otherCtx?.getImageData(0, 0, otherCanvas.width, otherCanvas.height);
        expect(otherResult).toEqual(data);
        expect(service.saveAction).toHaveBeenCalled();
    });
    it('should copy right on left', () => {
        spyOn(service, 'copyRightOnLeft').and.callThrough();
        spyOn(service, 'saveAction').and.callThrough();
        const data = otherCtx?.getImageData(0, 0, canvas.width, canvas.height);
        service.backgroundRegistry = [canvas, otherCanvas];
        service.copyRightOnLeft();
        const otherResult = ctx?.getImageData(0, 0, otherCanvas.width, otherCanvas.height);
        expect(otherResult).toEqual(data);
        expect(service.saveAction).toHaveBeenCalled();
    });
    it('should delete left', () => {
        spyOn(service, 'deleteLeft').and.callThrough();
        spyOn(service, 'saveAction').and.callThrough();
        spyOn(service, 'clearDrawing').and.callThrough();
        service.backgroundRegistry = [canvas, otherCanvas];
        service.deleteLeft();
        expect(service.clearDrawing).toHaveBeenCalledWith(canvas);
    });
    it('should delete right', () => {
        spyOn(service, 'deleteRight').and.callThrough();
        spyOn(service, 'saveAction').and.callThrough();
        spyOn(service, 'clearDrawing').and.callThrough();
        service.backgroundRegistry = [canvas, otherCanvas];
        service.deleteRight();
        expect(service.clearDrawing).toHaveBeenCalledWith(otherCanvas);
    });
    it('should clear the drawing', () => {
        service.currentCtx = ctx;
        spyOn(service, 'clearDrawing').and.callThrough();
        spyOn(service, 'setActiveCanvas').and.callThrough();
        spyOn(service.currentCtx, 'clearRect').and.callThrough();
        service.clearDrawing(canvas);
        expect(service.setActiveCanvas).toHaveBeenCalledWith(canvas);
        expect(service.currentCtx.clearRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
    });
    it('should save action', () => {
        spyOn(service, 'saveAction').and.callThrough();
        service.backgroundRegistry = [canvas, otherCanvas];
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const otherData = otherCtx.getImageData(0, 0, otherCanvas.width, otherCanvas.height);
        service.saveAction();
        expect(service.undo[0].left).toEqual(data);
        expect(service.undo[0].right).toEqual(otherData);
    });
    it('should undo action', () => {
        spyOn(service, 'undoAction').and.callThrough();
        service.backgroundRegistry = [canvas, otherCanvas];
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const otherData = otherCtx.getImageData(0, 0, otherCanvas.width, otherCanvas.height);
        service.undo.push({ left: data, right: data });
        service.undo.push({ left: otherData, right: otherData });
        service.undoAction();
        expect(ctx.getImageData(0, 0, canvas.width, canvas.height)).toEqual(data);
        expect(otherCtx.getImageData(0, 0, otherCanvas.width, otherCanvas.height)).toEqual(data);
    });
    it('should redo action', () => {
        spyOn(service, 'redoAction').and.callThrough();
        service.backgroundRegistry = [canvas, otherCanvas];
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const otherData = otherCtx.getImageData(0, 0, otherCanvas.width, otherCanvas.height);
        service.redo.push({ left: data, right: data });
        service.redo.push({ left: otherData, right: otherData });
        service.redoAction();
        expect(ctx.getImageData(0, 0, canvas.width, canvas.height)).toEqual(data);
        expect(otherCtx.getImageData(0, 0, otherCanvas.width, otherCanvas.height)).toEqual(data);
    });
    it('should unregister canvases', () => {
        spyOn(service, 'unregister').and.callThrough();
        service.unregister();
        expect(service.canvasRegistry.length).toEqual(0);
        expect(service.backgroundRegistry.length).toEqual(0);
        expect(service.undo).toEqual([]);
        expect(service.redo).toEqual([]);
    });
    it('should print drawings on background canvases', () => {
        spyOn(service, 'printDrawing').and.callThrough();
        const mockCanvas1 = CanvasTestHelper.createCanvas(1, 1);
        const mockCanvas2 = CanvasTestHelper.createCanvas(1, 1);

        service.canvasRegistry = [mockCanvas1, mockCanvas2];
        service.backgroundRegistry = [canvas, otherCanvas];
        service.printDrawing();
        expect(canvas.toDataURL()).toEqual(mockCanvas1.toDataURL());
        expect(otherCanvas.toDataURL()).toEqual(mockCanvas2.toDataURL());
    });
    it('should sync left drawing', () => {
        spyOn(service, 'getLeftDrawing').and.callThrough();
        spyOn(service, 'sync').and.callThrough();
        service.backgroundRegistry = [canvas, otherCanvas];
        service.getLeftDrawing(otherCanvas);
        expect(service.sync).toHaveBeenCalledWith(otherCanvas, canvas);
    });
    it('should sync right drawing', () => {
        spyOn(service, 'getRightDrawing').and.callThrough();
        spyOn(service, 'sync').and.callThrough();
        service.backgroundRegistry = [canvas, otherCanvas];
        service.getRightDrawing(canvas);
        expect(service.sync).toHaveBeenCalledWith(canvas, otherCanvas);
    });
    it('should sync a drawing', () => {
        spyOn(service, 'sync').and.callThrough();
        const mockCanvas1 = CanvasTestHelper.createCanvas(1, 1);
        const mockCtx1 = mockCanvas1.getContext('2d');
        mockCtx1?.drawImage(otherCanvas, 0, 0);
        const mockData = mockCtx1?.getImageData(0, 0, mockCanvas1.width, mockCanvas1.height);
        const result = service.sync(canvas, otherCanvas);
        expect(result).toEqual(mockData);
    });
    it('should convert left drawing to base64', () => {
        spyOn(service, 'base64Left').and.callThrough();
        spyOn(service, 'convertToBase64').and.callThrough();
        service.backgroundRegistry = [canvas, otherCanvas];
        service.base64Left(otherCanvas);
        expect(service.convertToBase64).toHaveBeenCalledWith(otherCanvas, canvas);
    });
    it('should convert right drawing to base64', () => {
        spyOn(service, 'base64Right').and.callThrough();
        spyOn(service, 'convertToBase64').and.callThrough();
        service.backgroundRegistry = [canvas, otherCanvas];
        service.base64Right(canvas);
        expect(service.convertToBase64).toHaveBeenCalledWith(canvas, otherCanvas);
    });
    it('should convert a drawing to base64', async () => {
        spyOn(service, 'convertToBase64').and.callThrough();
        const mockCanvas1 = CanvasTestHelper.createCanvas(1, 1);
        const mockCtx1 = mockCanvas1.getContext('2d');
        mockCtx1?.drawImage(otherCanvas, 0, 0);
        const mockData = mockCanvas1.toDataURL('image/png').split(',')[1];
        const result = await service.convertToBase64(canvas, otherCanvas);
        expect(result).toEqual(mockData);
    });
    it('should set the background ctx correctly', () => {
        service.currentCtx = ctx;
        service.canvasRegistry = [canvas, otherCanvas];
        service.backgroundRegistry = [canvas, canvas];
        spyOn(service, 'setBackgroundCtx').and.callThrough();
        service.setBackgroundCtx();
        expect(service.currentBackgroundCtx).toEqual(ctx);
    });
    it('should set the other background ctx correctly', () => {
        service.currentCtx = ctx;
        service.canvasRegistry = [otherCanvas, canvas];
        service.backgroundRegistry = [canvas, canvas];
        spyOn(service, 'setBackgroundCtx').and.callThrough();
        service.setBackgroundCtx();
        expect(service.currentBackgroundCtx).toEqual(ctx);
    });
});
