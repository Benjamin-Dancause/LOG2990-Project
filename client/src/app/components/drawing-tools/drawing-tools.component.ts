import { Component, HostListener, OnInit } from '@angular/core';
import { DrawingService, Tools } from '@app/services/drawing/drawing.service';

@Component({
    selector: 'app-drawing-tools',
    templateUrl: './drawing-tools.component.html',
    styleUrls: ['./drawing-tools.component.scss'],
})
export class DrawingToolsComponent implements OnInit {
    constructor(private drawingService: DrawingService /*private drawingCanvasDirective: DrawingCanvasDirective*/) {}
    color: string;
    radius: number;
    activeButton: string = Tools.PEN;

    ngOnInit(): void {
        this.radius = 5;
        this.setRadius();
    }

    selectPen(): void {
        this.activeButton = Tools.PEN;
        this.drawingService.setTool(Tools.PEN);
    }
    selectEraser(): void {
        this.activeButton = Tools.ERASER;
        this.drawingService.setTool(Tools.ERASER);
    }
    selectRectangle(): void {
        this.activeButton = Tools.RECTANGLE;
        this.drawingService.setTool(Tools.RECTANGLE);
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
}
