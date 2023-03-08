import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements OnInit {
    @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;

    constructor(private drawingService: DrawingService) {}

    ngOnInit() {}

    onMouseDown(event: MouseEvent) {
        this.drawingService.start(event, event.target as HTMLCanvasElement);
    }

    onMouseMove(event: MouseEvent) {
        this.drawingService.execute(event);
    }

    onMouseUp(event: MouseEvent) {
        this.drawingService.end();
    }
}
