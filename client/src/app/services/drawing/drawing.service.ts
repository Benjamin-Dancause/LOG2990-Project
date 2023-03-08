import { ElementRef, Injectable, ViewChildren } from '@angular/core';
import { Coords } from '@app/classes/coords';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    @ViewChildren('drawingCanvas') canvases: ElementRef<HTMLCanvasElement>;
    private currentTool: string = 'pen';
    currentCanvas: HTMLCanvasElement;
    currentCtx: CanvasRenderingContext2D | null;
    canvasRegistry: HTMLCanvasElement[] = [];
    private isDrawing: boolean = false;
    private currentColor: string;
    private currentRadius: number;
    lastPos: Coords;
    constructor() {}

    register(canvas: HTMLCanvasElement): void {
        this.canvasRegistry.push(canvas);
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
    setActiveCanvas(canvas: HTMLCanvasElement) {
        this.currentCanvas = canvas;
        this.currentCtx = this.currentCanvas.getContext('2d');
    }
    start(event: MouseEvent, canvas: HTMLCanvasElement): void {
        this.setActiveCanvas(canvas);
        this.isDrawing = true;
        this.lastPos = { x: event.offsetX, y: event.offsetY };
        this.currentCtx?.beginPath();
    }
    end(): void {
        this.isDrawing = false;
    }
    execute(event: MouseEvent): void {
        if (!this.isDrawing) {
            return;
        }
        switch (this.currentTool) {
            case 'pen':
                this.draw(event);
                break;
            case 'eraser':
                this.erase(event);
                break;
            default:
                break;
        }
    }

    draw(event: MouseEvent) {
        if (this.currentCtx) {
            this.currentCtx.moveTo(this.lastPos.x, this.lastPos.y);
            this.currentCtx.lineTo(event.offsetX, event.offsetY);
            this.currentCtx.strokeStyle = this.currentColor;
            this.currentCtx.lineCap = 'round';
            this.currentCtx.lineJoin = 'round';
            this.currentCtx.lineWidth = this.currentRadius;
            this.currentCtx.stroke();
            this.lastPos = { x: event.offsetX, y: event.offsetY };
        }
    }
    erase(event: MouseEvent) {
        if (this.currentCtx) {
            this.currentCtx.clearRect(
                event.offsetX - this.currentRadius * 0.5,
                event.offsetY - this.currentRadius * 0.5,
                this.currentRadius,
                this.currentRadius,
            );
        }
    }
    clearDrawing(canvas: HTMLCanvasElement) {
        this.setActiveCanvas(canvas);
        this.currentCtx?.clearRect(0, 0, 640, 480);
    }
    swapDrawings(): void {
        let firstCtx = this.canvasRegistry[0].getContext('2d');
        let secondCtx = this.canvasRegistry[1].getContext('2d');
        if (firstCtx && secondCtx) {
            const image1 = firstCtx.getImageData(0, 0, 640, 480);
            const image2 = secondCtx.getImageData(0, 0, 640, 480);
            firstCtx.clearRect(0, 0, 640, 480);
            secondCtx.clearRect(0, 0, 640, 480);

            firstCtx.putImageData(image2, 0, 0);
            secondCtx.putImageData(image1, 0, 0);
        }
    }
}
