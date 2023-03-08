import { Component, OnInit } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Component({
    selector: 'app-drawing-tools',
    templateUrl: './drawing-tools.component.html',
    styleUrls: ['./drawing-tools.component.scss'],
})
export class DrawingToolsComponent implements OnInit {
    constructor(private drawingService: DrawingService /*private drawingCanvasDirective: DrawingCanvasDirective*/) {}
    color: string;
    radius: number;

    ngOnInit(): void {
        this.radius = 25;
        this.setRadius();
    }

    selectPen(): void {
        this.drawingService.setTool('pen');
    }
    selectEraser(): void {
        this.drawingService.setTool('eraser');
    }
    selectRectangle(): void {
        this.drawingService.setTool('rectangle');
    }
    setColor(): void {
        this.drawingService.setColor(this.color);
    }
    setRadius(): void {
        this.drawingService.setRadius(this.radius);
    }
    swapDrawings(): void {
        this.drawingService.swapDrawings();
    }
}
