import { ElementRef, Injectable, ViewChildren } from '@angular/core';
import { Coords } from '@app/classes/coords';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    @ViewChildren('drawingCanvas') canvases: ElementRef<HTMLCanvasElement>;
    private currentTool: string = 'pen';
    private isDrawing: boolean = false;
    private currentColor: string;
    private currentRadius: number;
    currentCanvas: HTMLCanvasElement;
    currentCtx: CanvasRenderingContext2D | null;
    canvasRegistry: HTMLCanvasElement[] = [];
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
        console.log(this.currentColor);
    }
    setRadius(radius: number): void {
        this.currentRadius = radius;
    }
    setActiveCanvas(canvas: HTMLCanvasElement): void {
        this.currentCanvas = canvas;
        this.currentCtx = this.currentCanvas.getContext('2d');
    }
    start(event: MouseEvent, canvas: HTMLCanvasElement): void {
        this.setActiveCanvas(canvas);
        this.isDrawing = true;
        this.lastPos = { x: event.offsetX, y: event.offsetY };
        if (this.currentCtx) {
            this.currentCtx.beginPath();
            this.currentCtx.lineCap = 'round';
            this.currentCtx.lineJoin = 'round';
            this.currentCtx.lineWidth = this.currentRadius;
        }
    }
    end(): void {
        this.isDrawing = false;
        this.currentCtx?.clearRect(0, 0, 640, 480);
    }
    execute(event: MouseEvent): void {
        if (!this.isDrawing || this.currentCanvas != event.target) {
            return;
        }
        switch (this.currentTool) {
            case 'pen':
                this.draw(event);
                break;
            case 'eraser':
                this.erase(event);
                break;
            case 'rectangle':
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
            this.currentCtx.clearRect(
                event.offsetX - this.currentRadius * 0.5,
                event.offsetY - this.currentRadius * 0.5,
                this.currentRadius,
                this.currentRadius,
            );
        }
    }
    drawRectangle(event: MouseEvent): void {
        if (this.currentCtx) {
            this.currentCtx.fillStyle = this.currentColor;
            this.currentCtx.clearRect(0, 0, 640, 480);
            this.currentCtx.fillRect(event.offsetX, event.offsetY, this.lastPos.x - event.offsetX, this.lastPos.y - event.offsetY);
        }
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
    copyLeftOnRight(): void {
        let firstCtx = this.canvasRegistry[0].getContext('2d');
        let secondCtx = this.canvasRegistry[1].getContext('2d');
        if (firstCtx && secondCtx) {
            const image = firstCtx.getImageData(0, 0, 640, 480);
            secondCtx.clearRect(0, 0, 640, 480);
            secondCtx.putImageData(image, 0, 0);
        }
    }
    copyRightOnLeft(): void {
        let firstCtx = this.canvasRegistry[0].getContext('2d');
        let secondCtx = this.canvasRegistry[1].getContext('2d');
        if (firstCtx && secondCtx) {
            const image = secondCtx.getImageData(0, 0, 640, 480);
            firstCtx.clearRect(0, 0, 640, 480);
            firstCtx.putImageData(image, 0, 0);
        }
    }
    deleteLeft(): void {
        this.clearDrawing(this.canvasRegistry[0]);
    }
    deleteRight(): void {
        this.clearDrawing(this.canvasRegistry[1]);
    }
    clearDrawing(canvas: HTMLCanvasElement): void {
        this.setActiveCanvas(canvas);
        this.currentCtx?.clearRect(0, 0, 640, 480);
    }
    unregister(): void {
        this.canvasRegistry.length = 0;
    }
    test(): void {
        let firstCtx = this.canvasRegistry[0].getContext('2d');
        let secondCtx = this.canvasRegistry[1];
        if (firstCtx && secondCtx) {
            firstCtx.drawImage(secondCtx, 0, 0);
        }
    }
}
