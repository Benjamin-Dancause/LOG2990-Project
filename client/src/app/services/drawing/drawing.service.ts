import { Injectable } from '@angular/core';
import { Coords } from '@app/classes/coords';
import { CANVAS, DRAWING } from '@common/constants';

export interface History {
    left: ImageData;
    right: ImageData;
}
@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    currentTool: string = DRAWING.PEN;
    isDrawing: boolean = false;
    square: boolean = false;
    currentColor: string = DRAWING.BASE_COLOR;
    currentRadius: number;
    currentCanvas: HTMLCanvasElement;
    currentCtx: CanvasRenderingContext2D | null;
    currentBackgroundCtx: CanvasRenderingContext2D | null;
    canvasRegistry: HTMLCanvasElement[] = [];
    backgroundRegistry: HTMLCanvasElement[] = [];
    undo: History[] = [];
    redo: History[] = [];
    lastPos: Coords;
    constructor() {
        this.undo = [];
        this.redo = [];
    }

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
        console.log(this.lastPos);
        if (this.currentCtx) {
            this.currentCtx.beginPath();
            this.currentCtx.lineWidth = this.currentRadius;
        }
        this.setBackgroundCtx();
        this.execute(event);
    }
    end(): void {
        console.log(this.lastPos);
        this.isDrawing = false;
        this.printDrawing();
        this.currentCtx?.clearRect(CANVAS.CORNER, CANVAS.CORNER, this.currentCanvas.width, this.currentCanvas.height);
        this.saveAction();
    }
    execute(event: MouseEvent): void {
        if (!this.isDrawing || this.currentCanvas !== event.target) {
            return;
        }
        switch (this.currentTool) {
            case DRAWING.PEN:
                this.draw(event);
                break;
            case DRAWING.ERASER:
                this.erase(event);
                break;
            case DRAWING.RECTANGLE:
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
            this.currentCtx.lineCap = DRAWING.PEN_TIP;
            this.currentCtx.lineJoin = DRAWING.PEN_TIP;
            this.currentCtx.strokeStyle = this.currentColor;
            this.currentCtx.stroke();
            this.lastPos = { x: event.offsetX, y: event.offsetY };
        }
    }
    erase(event: MouseEvent): void {
        if (this.currentBackgroundCtx) {
            const distance = Math.sqrt((event.offsetX - this.lastPos.x) ** DRAWING.SQUARED + (event.offsetY - this.lastPos.y) ** DRAWING.SQUARED);
            const angle = Math.atan2(event.offsetY - this.lastPos.y, event.offsetX - this.lastPos.x);
            const steps = Math.ceil(distance / this.currentRadius);

            for (let i = 0; i < steps; i++) {
                const x = this.lastPos.x + (Math.cos(angle) * distance * i) / steps;
                const y = this.lastPos.y + (Math.sin(angle) * distance * i) / steps;

                this.currentBackgroundCtx.clearRect(
                    x - this.currentRadius * DRAWING.MIDDLE_OFFSET,
                    y - this.currentRadius * DRAWING.MIDDLE_OFFSET,
                    this.currentRadius,
                    this.currentRadius,
                );
            }
            this.lastPos = { x: event.offsetX, y: event.offsetY };
        }
    }
    drawRectangle(event: MouseEvent): void {
        if (this.currentCtx && !this.square) {
            this.currentCtx.fillStyle = this.currentColor;
            this.currentCtx.clearRect(CANVAS.CORNER, CANVAS.CORNER, CANVAS.WIDTH, CANVAS.HEIGHT);
            this.currentCtx.fillRect(event.offsetX, event.offsetY, this.lastPos.x - event.offsetX, this.lastPos.y - event.offsetY);
        } else if (this.currentCtx && this.square) {
            this.currentCtx.fillStyle = this.currentColor;
            this.currentCtx.clearRect(CANVAS.CORNER, CANVAS.CORNER, CANVAS.WIDTH, CANVAS.HEIGHT);
            const width = event.offsetX - this.lastPos.x;
            const height = event.offsetY - this.lastPos.y;
            const size = Math.max(Math.abs(width), Math.abs(height));
            const startX = width >= 0 ? this.lastPos.x : this.lastPos.x - size;
            const startY = height >= 0 ? this.lastPos.y : this.lastPos.y - size;
            this.currentCtx.fillRect(startX, startY, size, size);
        }
    }
    isSquare(): void {
        this.square = true;
    }
    notSquare(): void {
        this.square = false;
    }
    swapDrawings(): void {
        const backgroundFirstCtx = this.backgroundRegistry[CANVAS.LEFT].getContext('2d', { willReadFrequently: true });
        const backgroundSecondCtx = this.backgroundRegistry[CANVAS.RIGHT].getContext('2d', { willReadFrequently: true });
        if (backgroundFirstCtx && backgroundSecondCtx) {
            const image1 = backgroundFirstCtx.getImageData(
                CANVAS.CORNER,
                CANVAS.CORNER,
                this.backgroundRegistry[CANVAS.LEFT].width,
                this.backgroundRegistry[CANVAS.LEFT].height,
            );
            const image2 = backgroundSecondCtx.getImageData(
                CANVAS.CORNER,
                CANVAS.CORNER,
                this.backgroundRegistry[CANVAS.RIGHT].width,
                this.backgroundRegistry[CANVAS.RIGHT].height,
            );
            backgroundFirstCtx.putImageData(image2, CANVAS.CORNER, CANVAS.CORNER);
            backgroundSecondCtx.putImageData(image1, CANVAS.CORNER, CANVAS.CORNER);
        }
        this.saveAction();
    }
    copyLeftOnRight(): void {
        const backgroundFirstCtx = this.backgroundRegistry[CANVAS.LEFT].getContext('2d', { willReadFrequently: true });
        const backgroundSecondCtx = this.backgroundRegistry[CANVAS.RIGHT].getContext('2d', { willReadFrequently: true });
        if (backgroundFirstCtx && backgroundSecondCtx) {
            const image = backgroundFirstCtx.getImageData(
                CANVAS.CORNER,
                CANVAS.CORNER,
                this.backgroundRegistry[CANVAS.LEFT].width,
                this.backgroundRegistry[CANVAS.RIGHT].height,
            );
            backgroundSecondCtx.clearRect(
                CANVAS.CORNER,
                CANVAS.CORNER,
                this.backgroundRegistry[CANVAS.LEFT].width,
                this.backgroundRegistry[CANVAS.RIGHT].height,
            );
            backgroundSecondCtx.putImageData(image, CANVAS.CORNER, CANVAS.CORNER);
        }
        this.saveAction();
    }
    copyRightOnLeft(): void {
        const backgroundFirstCtx = this.backgroundRegistry[CANVAS.LEFT].getContext('2d', { willReadFrequently: true });
        const backgroundSecondCtx = this.backgroundRegistry[CANVAS.RIGHT].getContext('2d', { willReadFrequently: true });
        if (backgroundFirstCtx && backgroundSecondCtx) {
            const image = backgroundSecondCtx.getImageData(
                CANVAS.CORNER,
                CANVAS.CORNER,
                this.backgroundRegistry[CANVAS.RIGHT].width,
                this.backgroundRegistry[CANVAS.RIGHT].height,
            );
            backgroundFirstCtx.clearRect(
                CANVAS.CORNER,
                CANVAS.CORNER,
                this.backgroundRegistry[CANVAS.LEFT].width,
                this.backgroundRegistry[CANVAS.LEFT].height,
            );
            backgroundFirstCtx.putImageData(image, CANVAS.CORNER, CANVAS.CORNER);
        }
        this.saveAction();
    }
    deleteLeft(): void {
        this.clearDrawing(this.backgroundRegistry[CANVAS.LEFT]);
        this.saveAction();
    }
    deleteRight(): void {
        this.clearDrawing(this.backgroundRegistry[CANVAS.RIGHT]);
        this.saveAction();
    }
    clearDrawing(canvas: HTMLCanvasElement): void {
        this.setActiveCanvas(canvas);
        this.currentCtx?.clearRect(CANVAS.CORNER, CANVAS.CORNER, canvas.width, canvas.height);
    }
    saveAction(): void {
        const backgroundFirstCtx = this.backgroundRegistry[CANVAS.LEFT].getContext('2d', { willReadFrequently: true });
        const backgroundSecondCtx = this.backgroundRegistry[CANVAS.RIGHT].getContext('2d', { willReadFrequently: true });
        const left = backgroundFirstCtx?.getImageData(
            CANVAS.CORNER,
            CANVAS.CORNER,
            this.backgroundRegistry[CANVAS.LEFT].width,
            this.backgroundRegistry[CANVAS.LEFT].height,
        );
        const right = backgroundSecondCtx?.getImageData(
            CANVAS.CORNER,
            CANVAS.CORNER,
            this.backgroundRegistry[CANVAS.RIGHT].width,
            this.backgroundRegistry[CANVAS.RIGHT].height,
        );
        if (left && right) {
            this.undo.push({
                left,
                right,
            });
        }
    }
    undoAction(): void {
        if (this.undo.length > 1) {
            const undo = this.undo.pop();
            if (undo) {
                this.redo.push(undo);
                const backgroundFirstCtx = this.backgroundRegistry[CANVAS.LEFT].getContext('2d', { willReadFrequently: true });
                const backgroundSecondCtx = this.backgroundRegistry[CANVAS.RIGHT].getContext('2d', { willReadFrequently: true });
                if (backgroundFirstCtx && backgroundSecondCtx && this.undo[this.undo.length - 1]) {
                    backgroundFirstCtx.putImageData(this.undo[this.undo.length - 1].left, CANVAS.CORNER, CANVAS.CORNER);
                    backgroundSecondCtx.putImageData(this.undo[this.undo.length - 1].right, CANVAS.CORNER, CANVAS.CORNER);
                }
            }
        }
    }
    redoAction(): void {
        const redo = this.redo.pop();
        if (redo) {
            this.undo.push(redo);
            const backgroundFirstCtx = this.backgroundRegistry[CANVAS.LEFT].getContext('2d', { willReadFrequently: true });
            const backgroundSecondCtx = this.backgroundRegistry[CANVAS.RIGHT].getContext('2d', { willReadFrequently: true });
            if (backgroundFirstCtx && backgroundSecondCtx) {
                backgroundFirstCtx.putImageData(redo.left, CANVAS.CORNER, CANVAS.CORNER);
                backgroundSecondCtx.putImageData(redo.right, CANVAS.CORNER, CANVAS.CORNER);
            }
        }
    }

    unregister(): void {
        this.canvasRegistry.length = CANVAS.RESET;
        this.backgroundRegistry.length = CANVAS.RESET;
        this.undo = [];
        this.redo = [];
    }
    printDrawing(): void {
        const firstCanvas = this.canvasRegistry[CANVAS.LEFT];
        const secondCanvas = this.canvasRegistry[CANVAS.RIGHT];
        const backgroundFirstCtx = this.backgroundRegistry[CANVAS.LEFT].getContext('2d', { willReadFrequently: true });
        const backgroundSecondCtx = this.backgroundRegistry[CANVAS.RIGHT].getContext('2d', { willReadFrequently: true });
        if (backgroundFirstCtx && backgroundSecondCtx) {
            backgroundFirstCtx.drawImage(firstCanvas, CANVAS.CORNER, CANVAS.CORNER);
            backgroundSecondCtx.drawImage(secondCanvas, CANVAS.CORNER, CANVAS.CORNER);
        }
    }
    getLeftDrawing(canvas: HTMLCanvasElement): ImageData | undefined {
        return this.sync(canvas, this.backgroundRegistry[CANVAS.LEFT]);
    }
    getRightDrawing(canvas: HTMLCanvasElement): ImageData | undefined {
        return this.sync(canvas, this.backgroundRegistry[CANVAS.RIGHT]);
    }
    sync(background: HTMLCanvasElement, drawing: HTMLCanvasElement): ImageData | undefined {
        const canvas = document.createElement('canvas');
        canvas.width = drawing.width;
        canvas.height = drawing.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(background, CANVAS.CORNER, CANVAS.CORNER, canvas.width, canvas.height);
            ctx.drawImage(drawing, CANVAS.CORNER, CANVAS.CORNER, canvas.width, canvas.height);
        }
        return ctx?.getImageData(CANVAS.CORNER, CANVAS.CORNER, canvas.width, canvas.height);
    }
    async base64Left(image: HTMLCanvasElement): Promise<string> {
        return this.convertToBase64(image, this.backgroundRegistry[CANVAS.LEFT]);
    }
    async base64Right(image: HTMLCanvasElement): Promise<string> {
        return this.convertToBase64(image, this.backgroundRegistry[CANVAS.RIGHT]);
    }
    async convertToBase64(image: HTMLCanvasElement, drawing: HTMLCanvasElement): Promise<string> {
        const canvas = document.createElement('canvas');
        canvas.width = drawing.width;
        canvas.height = drawing.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(image, CANVAS.CORNER, CANVAS.CORNER, canvas.width, canvas.height);
            ctx.drawImage(drawing, CANVAS.CORNER, CANVAS.CORNER, canvas.width, canvas.height);
        }
        return canvas.toDataURL('image/png').split(',')[1];
    }
    setBackgroundCtx(): void {
        const ctxDrawingLeft = this.canvasRegistry[CANVAS.LEFT].getContext('2d', { willReadFrequently: true });
        const ctxDrawingRight = this.canvasRegistry[CANVAS.RIGHT].getContext('2d', { willReadFrequently: true });
        if (this.currentCtx === ctxDrawingLeft) {
            this.currentBackgroundCtx = this.backgroundRegistry[CANVAS.LEFT].getContext('2d', { willReadFrequently: true });
        } else if (this.currentCtx === ctxDrawingRight) {
            this.currentBackgroundCtx = this.backgroundRegistry[CANVAS.RIGHT].getContext('2d', { willReadFrequently: true });
        }
    }
}
