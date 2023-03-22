import { Component, HostListener, OnInit } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DRAWING } from '@common/constants';

@Component({
    selector: 'app-drawing-tools',
    templateUrl: './drawing-tools.component.html',
    styleUrls: ['./drawing-tools.component.scss'],
})
export class DrawingToolsComponent implements OnInit {
    color: string;
    radius: number;
    activeButton: string = DRAWING.PEN;

    constructor(private drawingService: DrawingService) {}

    @HostListener('document:keydown.control.z')
    undo(): void {
        this.drawingService.undoAction();
    }
    @HostListener('document:keydown.control.shift.z')
    redo(): void {
        this.drawingService.redoAction();
    }
    @HostListener('document:keydown.shift', ['$event'])
    isSquare(): void {
        this.drawingService.isSquare();
    }
    @HostListener('document:keyup.shift', ['$event'])
    notSquare(): void {
        this.drawingService.notSquare();
    }

    ngOnInit(): void {
        this.radius = 5;
        this.setRadius();
        this.selectPen();
    }

    selectPen(): void {
        this.activeButton = DRAWING.PEN;
        this.drawingService.setTool(DRAWING.PEN);
    }
    selectEraser(): void {
        this.activeButton = DRAWING.ERASER;
        this.drawingService.setTool(DRAWING.ERASER);
    }
    selectRectangle(): void {
        this.activeButton = DRAWING.RECTANGLE;
        this.drawingService.setTool(DRAWING.RECTANGLE);
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
    copyLeft(): void {
        this.drawingService.copyLeftOnRight();
    }
    copyRight(): void {
        this.drawingService.copyRightOnLeft();
    }
    deleteLeft(): void {
        this.drawingService.deleteLeft();
    }
    deleteRight(): void {
        this.drawingService.deleteRight();
    }
}
