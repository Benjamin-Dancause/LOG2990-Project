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
    backgroundRegistry: HTMLCanvasElement[] = [];
    lastPos: Coords;
    constructor() {}

    register(canvas: HTMLCanvasElement): void {
        this.canvasRegistry.push(canvas);
    }
    registerBackground(canvas: HTMLCanvasElement): void {
        this.backgroundRegistry.push(canvas);
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
        this.printDrawing();
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
            this.currentCtx.moveTo(this.lastPos.x, this.lastPos.y);
            this.currentCtx.lineTo(event.offsetX, event.offsetY);
            this.currentCtx.strokeStyle = 'white';
            this.currentCtx.stroke();
            this.lastPos = { x: event.offsetX, y: event.offsetY };
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
        const backgroundFirstCtx = this.backgroundRegistry[0].getContext('2d');
        const backgroundSecondCtx = this.backgroundRegistry[1].getContext('2d');
        if (backgroundFirstCtx && backgroundSecondCtx) {
            const image1 = backgroundFirstCtx.getImageData(0, 0, 640, 480);
            const image2 = backgroundSecondCtx.getImageData(0, 0, 640, 480);
            backgroundFirstCtx.clearRect(0, 0, 640, 480);
            backgroundSecondCtx.clearRect(0, 0, 640, 480);

            backgroundFirstCtx.putImageData(image2, 0, 0);
            backgroundSecondCtx.putImageData(image1, 0, 0);
        }
    }
    copyLeftOnRight(): void {
        const backgroundFirstCtx = this.backgroundRegistry[0].getContext('2d');
        const backgroundSecondCtx = this.backgroundRegistry[1].getContext('2d');
        if (backgroundFirstCtx && backgroundSecondCtx) {
            const image = backgroundFirstCtx.getImageData(0, 0, 640, 480);
            backgroundSecondCtx.clearRect(0, 0, 640, 480);
            backgroundSecondCtx.putImageData(image, 0, 0);
        }
    }
    copyRightOnLeft(): void {
        const backgroundFirstCtx = this.backgroundRegistry[0].getContext('2d');
        const backgroundSecondCtx = this.backgroundRegistry[1].getContext('2d');
        if (backgroundFirstCtx && backgroundSecondCtx) {
            const image = backgroundSecondCtx.getImageData(0, 0, 640, 480);
            backgroundFirstCtx.clearRect(0, 0, 640, 480);
            backgroundFirstCtx.putImageData(image, 0, 0);
        }
    }
    deleteLeft(): void {
        this.clearDrawing(this.backgroundRegistry[0]);
    }
    deleteRight(): void {
        this.clearDrawing(this.backgroundRegistry[1]);
    }
    clearDrawing(canvas: HTMLCanvasElement): void {
        this.setActiveCanvas(canvas);
        this.currentCtx?.clearRect(0, 0, 640, 480);
    }
    unregister(): void {
        this.canvasRegistry.length = 0;
    }
    printDrawing(): void {
        const firstCanvas = this.canvasRegistry[0];
        const secondCanvas = this.canvasRegistry[1];
        const backgroundFirstCtx = this.backgroundRegistry[0].getContext('2d');
        const backgroundSecondCtx = this.backgroundRegistry[1].getContext('2d');
        if (backgroundFirstCtx && backgroundSecondCtx) {
            backgroundFirstCtx.drawImage(firstCanvas, 0, 0);
            backgroundSecondCtx.drawImage(secondCanvas, 0, 0);
        }
    }
    test(): void {}
}
