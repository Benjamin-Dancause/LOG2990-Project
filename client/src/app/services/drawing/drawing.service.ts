import { ElementRef, Injectable, ViewChildren } from '@angular/core';
import { Coords } from '@app/classes/coords';

export interface History {
    left: ImageData;
    right: ImageData;
}
export enum Tools {
    PEN = 'pen',
    ERASER = 'eraser',
    RECTANGLE = 'rectangle',
}
@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    @ViewChildren('drawingCanvas') canvases: ElementRef<HTMLCanvasElement>;
    private currentTool: string = 'pen';
    private isDrawing: boolean = false;
    private square: boolean = false;
    private currentColor: string = '#000000';
    private currentRadius: number;
    currentCanvas: HTMLCanvasElement;
    currentCtx: CanvasRenderingContext2D | null;
    canvasRegistry: HTMLCanvasElement[] = [];
    backgroundRegistry: HTMLCanvasElement[] = [];
    undo: History[];
    redo: History[];
    lastPos: Coords;
    constructor() {}

    register(canvas: HTMLCanvasElement): void {
        this.canvasRegistry.push(canvas);
        this.undo = [];
        this.redo = [];
    }
    registerBackground(canvas: HTMLCanvasElement): void {
        this.backgroundRegistry.push(canvas);
    }
    setTool(tool: string): void {
        this.currentTool = tool;
    }
    setColor(color: string): void {
        this.currentColor = color;
    }
    setRadius(radius: number): void {
        this.currentRadius = radius;
    }
    setActiveCanvas(canvas: HTMLCanvasElement): void {
        this.currentCanvas = canvas;
        this.currentCtx = this.currentCanvas.getContext('2d', { willReadFrequently: true });
    }
    start(event: MouseEvent, canvas: HTMLCanvasElement): void {
        this.redo = [];
        this.setActiveCanvas(canvas);
        this.isDrawing = true;
        this.lastPos = { x: event.offsetX, y: event.offsetY };
        if (this.currentCtx) {
            this.currentCtx.beginPath();
            this.currentCtx.lineWidth = this.currentRadius;
            this.currentCtx.lineCap = 'round';
            this.currentCtx.lineJoin = 'round';
        }
        this.execute(event);
    }
    end(): void {
        this.isDrawing = false;
        this.printDrawing();
        this.currentCtx?.clearRect(0, 0, 640, 480);
        this.saveAction();
    }
    execute(event: MouseEvent): void {
        if (!this.isDrawing || this.currentCanvas != event.target) {
            return;
        }
        switch (this.currentTool) {
            case Tools.PEN:
                this.draw(event);
                break;
            case Tools.ERASER:
                this.erase(event);
                break;
            case Tools.RECTANGLE:
                this.drawRectangle(event);
                break;
            default:
                break;
        }
    }

    draw(event: MouseEvent): void {
        if (this.currentCtx) {
            this.currentCtx.moveTo(this.lastPos.x, this.lastPos.y);
            this.currentCtx.lineTo(event.offsetX, event.offsetY);
            this.currentCtx.strokeStyle = this.currentColor;
            this.currentCtx.stroke();
            this.lastPos = { x: event.offsetX, y: event.offsetY };
        }
    }
    erase(event: MouseEvent): void {
        if (this.currentCtx) {
            this.currentCtx.moveTo(this.lastPos.x, this.lastPos.y);
            this.currentCtx.lineTo(event.offsetX, event.offsetY);
            this.currentCtx.strokeStyle = 'white';
            this.currentCtx.stroke();
            this.lastPos = { x: event.offsetX, y: event.offsetY };
        }
    }
    drawRectangle(event: MouseEvent): void {
        if (this.currentCtx && !this.square) {
            this.currentCtx.fillStyle = this.currentColor;
            this.currentCtx.clearRect(0, 0, 640, 480);
            this.currentCtx.fillRect(event.offsetX, event.offsetY, this.lastPos.x - event.offsetX, this.lastPos.y - event.offsetY);
        } else if (this.currentCtx && this.square) {
            this.currentCtx.fillStyle = this.currentColor;
            this.currentCtx.clearRect(0, 0, 640, 480);
            const width = event.offsetX - this.lastPos.x;
            const height = event.offsetY - this.lastPos.y;
            const size = Math.min(width, height);
            this.currentCtx.fillRect(this.lastPos.x, this.lastPos.y, size, size);
        }
    }
    isSquare(): void {
        this.square = true;
    }
    notSquare(): void {
        this.square = false;
    }
    swapDrawings(): void {
        const backgroundFirstCtx = this.backgroundRegistry[0].getContext('2d', { willReadFrequently: true });
        const backgroundSecondCtx = this.backgroundRegistry[1].getContext('2d', { willReadFrequently: true });
        if (backgroundFirstCtx && backgroundSecondCtx) {
            const image1 = backgroundFirstCtx.getImageData(0, 0, 640, 480);
            const image2 = backgroundSecondCtx.getImageData(0, 0, 640, 480);

            backgroundFirstCtx.putImageData(image2, 0, 0);
            backgroundSecondCtx.putImageData(image1, 0, 0);
        }
        this.saveAction();
    }
    copyLeftOnRight(): void {
        const backgroundFirstCtx = this.backgroundRegistry[0].getContext('2d', { willReadFrequently: true });
        const backgroundSecondCtx = this.backgroundRegistry[1].getContext('2d', { willReadFrequently: true });
        if (backgroundFirstCtx && backgroundSecondCtx) {
            const image = backgroundFirstCtx.getImageData(0, 0, 640, 480);
            backgroundSecondCtx.clearRect(0, 0, 640, 480);
            backgroundSecondCtx.putImageData(image, 0, 0);
        }
        this.saveAction();
    }
    copyRightOnLeft(): void {
        const backgroundFirstCtx = this.backgroundRegistry[0].getContext('2d', { willReadFrequently: true });
        const backgroundSecondCtx = this.backgroundRegistry[1].getContext('2d', { willReadFrequently: true });
        if (backgroundFirstCtx && backgroundSecondCtx) {
            const image = backgroundSecondCtx.getImageData(0, 0, 640, 480);
            backgroundFirstCtx.clearRect(0, 0, 640, 480);
            backgroundFirstCtx.putImageData(image, 0, 0);
        }
        this.saveAction();
    }
    deleteLeft(): void {
        this.clearDrawing(this.backgroundRegistry[0]);
        this.saveAction();
    }
    deleteRight(): void {
        this.clearDrawing(this.backgroundRegistry[1]);
        this.saveAction();
    }
    clearDrawing(canvas: HTMLCanvasElement): void {
        this.setActiveCanvas(canvas);
        this.currentCtx?.clearRect(0, 0, 640, 480);
    }
    saveAction(): void {
        const backgroundFirstCtx = this.backgroundRegistry[0].getContext('2d', { willReadFrequently: true });
        const backgroundSecondCtx = this.backgroundRegistry[1].getContext('2d', { willReadFrequently: true });
        const left = backgroundFirstCtx?.getImageData(0, 0, 640, 480);
        const right = backgroundSecondCtx?.getImageData(0, 0, 640, 480);
        if (left && right) {
            this.undo.push({
                left: left,
                right: right,
            });
        }
    }
    undoAction(): void {
        const undo = this.undo.pop();
        if (undo) {
            this.redo.push(undo);
            const backgroundFirstCtx = this.backgroundRegistry[0].getContext('2d', { willReadFrequently: true });
            const backgroundSecondCtx = this.backgroundRegistry[1].getContext('2d', { willReadFrequently: true });
            if (backgroundFirstCtx && backgroundSecondCtx && this.undo[this.undo.length - 1]) {
                backgroundFirstCtx.putImageData(this.undo[this.undo.length - 1].left, 0, 0);
                backgroundSecondCtx.putImageData(this.undo[this.undo.length - 1].right, 0, 0);
                console.log('devrait undo' + this.undo[this.undo.length - 1]);
            }
        }
    }
    redoAction(): void {
        const redo = this.redo.pop();
        if (redo) {
            this.undo.push(redo);
            const backgroundFirstCtx = this.backgroundRegistry[0].getContext('2d', { willReadFrequently: true });
            const backgroundSecondCtx = this.backgroundRegistry[1].getContext('2d', { willReadFrequently: true });
            if (backgroundFirstCtx && backgroundSecondCtx) {
                backgroundFirstCtx.putImageData(redo.left, 0, 0);
                backgroundSecondCtx.putImageData(redo.right, 0, 0);
                console.log('devrait redo' + redo);
            }
        }
    }

    unregister(): void {
        this.canvasRegistry.length = 0;
        this.backgroundRegistry.length = 0;
        this.undo = [];
        this.redo = [];
    }
    printDrawing(): void {
        const firstCanvas = this.canvasRegistry[0];
        const secondCanvas = this.canvasRegistry[1];
        const backgroundFirstCtx = this.backgroundRegistry[0].getContext('2d', { willReadFrequently: true });
        const backgroundSecondCtx = this.backgroundRegistry[1].getContext('2d', { willReadFrequently: true });
        if (backgroundFirstCtx && backgroundSecondCtx) {
            backgroundFirstCtx.drawImage(firstCanvas, 0, 0);
            backgroundSecondCtx.drawImage(secondCanvas, 0, 0);
        }
    }
    getLeftDrawing(canvas: HTMLCanvasElement): ImageData | undefined {
        return this.sync(canvas, this.backgroundRegistry[0]);
    }
    getRightDrawing(canvas: HTMLCanvasElement): ImageData | undefined {
        return this.sync(canvas, this.backgroundRegistry[1]);
    }
    sync(background: HTMLCanvasElement, drawing: HTMLCanvasElement): ImageData | undefined {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(background, 0, 0, 640, 480);
            ctx.drawImage(drawing, 0, 0, 640, 480);
        }
        return ctx?.getImageData(0, 0, 640, 480);
    }
    base64Left(image: HTMLCanvasElement): Promise<string> {
        return this.convertToBase64(image, this.backgroundRegistry[0]);
    }
    base64Right(image: HTMLCanvasElement): Promise<string> {
        return this.convertToBase64(image, this.backgroundRegistry[1]);
    }
    async convertToBase64(image: HTMLCanvasElement, drawing: HTMLCanvasElement): Promise<string> {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(image, 0, 0, 640, 480);
            ctx.drawImage(drawing, 0, 0, 640, 480);
        }
        return canvas.toDataURL('image/png').split(',')[1];
    }
    test(): void {}
}
