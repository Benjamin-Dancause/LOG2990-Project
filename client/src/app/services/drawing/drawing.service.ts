import { Injectable } from '@angular/core';
import { Coords } from '@app/classes/coords';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    private currentTool: string = 'pen';
    currentCanvas: HTMLCanvasElement;
    currentCtx: CanvasRenderingContext2D | null;
    private isDrawing: boolean = false;
    private currentColor: string;
    private currentRadius: number;
    lastPos: Coords;
    constructor() {}

    setTool(tool: string): void {
        this.currentTool = tool;
        console.log(this.currentTool);
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
}
