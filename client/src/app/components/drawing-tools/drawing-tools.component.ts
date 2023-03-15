import { Component, HostListener, OnInit } from '@angular/core';
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
        this.radius = 5;
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
    test(): void {
        this.drawingService.test();
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === 'z') {
            if (event.shiftKey) {
                this.undo();
            } else {
                this.redo();
            }
        }
    }
}
