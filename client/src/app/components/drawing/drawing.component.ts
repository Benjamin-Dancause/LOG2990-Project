import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit, OnDestroy {
    @ViewChild('drawingCanvas') canvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('backgroundCanvas') backgroundCanvas: ElementRef<HTMLCanvasElement>;

    constructor(private drawingService: DrawingService) {}

    ngAfterViewInit() {
        this.drawingService.register(this.canvas.nativeElement);
        this.drawingService.registerBackground(this.backgroundCanvas.nativeElement);
    }

    onMouseDown(event: MouseEvent) {
        this.drawingService.start(event, event.target as HTMLCanvasElement);
    }
    onMouseMove(event: MouseEvent) {
        this.drawingService.execute(event);
    }
    onMouseUp(event: MouseEvent) {
        this.drawingService.end();
    }

    ngOnDestroy() {
        this.drawingService.unregister();
    }
}
