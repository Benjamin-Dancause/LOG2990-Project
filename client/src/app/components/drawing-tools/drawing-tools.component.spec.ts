import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';

import { DrawingToolsComponent } from './drawing-tools.component';

describe('DrawingToolsComponent', () => {
    let component: DrawingToolsComponent;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let fixture: ComponentFixture<DrawingToolsComponent>;

    beforeEach(async () => {
        drawingServiceSpy = jasmine.createSpyObj([
            'setRadius',
            'setTool',
            'setColor',
            'swapDrawings',
            'copyLeftOnRight',
            'copyRightOnLeft',
            'deleteLeft',
            'deleteRight',
            'undoAction',
            'redoAction',
            'isSquare',
            'notSquare',
        ]);
        await TestBed.configureTestingModule({
            declarations: [DrawingToolsComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(DrawingToolsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should set radius on init', () => {
        spyOn(component, 'ngOnInit').and.callThrough();
        spyOn(component, 'setRadius').and.callThrough();
        spyOn(component, 'selectPen').and.callThrough();
        component.ngOnInit();
        expect(component.radius).toEqual(5);
        expect(component.setRadius).toHaveBeenCalled();
        expect(component.selectPen).toHaveBeenCalled();
    });
    it('should change the tool to pen', () => {
        spyOn(component, 'selectPen').and.callThrough();
        const tool = 'pen';
        drawingServiceSpy.setTool(tool);
        component.selectPen();
        expect(component.activeButton).toEqual(tool);
        expect(drawingServiceSpy.setTool).toHaveBeenCalled();
    });
    it('should change the tool to eraser', () => {
        spyOn(component, 'selectEraser').and.callThrough();
        const tool = 'eraser';
        drawingServiceSpy.setTool(tool);
        component.selectEraser();
        expect(component.activeButton).toEqual(tool);
        expect(drawingServiceSpy.setTool).toHaveBeenCalled();
    });
    it('should change the tool to rectangle', () => {
        spyOn(component, 'selectRectangle').and.callThrough();
        const tool = 'rectangle';
        drawingServiceSpy.setTool(tool);
        component.selectRectangle();
        expect(component.activeButton).toEqual(tool);
        expect(drawingServiceSpy.setTool).toHaveBeenCalled();
    });
    it('should set the color', () => {
        spyOn(component, 'setColor').and.callThrough();
        const color = '#000000';
        component.color = color;
        component.setColor();
        expect(drawingServiceSpy.setColor).toHaveBeenCalled();
    });
    it('should set the radius', () => {
        spyOn(component, 'setRadius').and.callThrough();
        const radius = 5;
        component.radius = radius;
        component.setRadius();
        expect(drawingServiceSpy.setRadius).toHaveBeenCalled();
    });
    it('should swap drawings', () => {
        spyOn(component, 'swapDrawings').and.callThrough();
        component.swapDrawings();
        expect(drawingServiceSpy.swapDrawings).toHaveBeenCalled();
    });
    it('should copy the left canvas', () => {
        spyOn(component, 'copyLeft').and.callThrough();
        component.copyLeft();
        expect(drawingServiceSpy.copyLeftOnRight).toHaveBeenCalled();
    });
    it('should copy the right canvas', () => {
        spyOn(component, 'copyRight').and.callThrough();
        component.copyRight();
        expect(drawingServiceSpy.copyRightOnLeft).toHaveBeenCalled();
    });
    it('should delete the left canvas', () => {
        spyOn(component, 'deleteLeft').and.callThrough();
        component.deleteLeft();
        expect(drawingServiceSpy.deleteLeft).toHaveBeenCalled();
    });
    it('should delete the right canvas', () => {
        spyOn(component, 'deleteRight').and.callThrough();
        component.deleteRight();
        expect(drawingServiceSpy.deleteRight).toHaveBeenCalled();
    });
    it('should call undo method on control+z keydown', () => {
        spyOn(component, 'undo').and.callThrough();
        const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
        document.dispatchEvent(event);
        expect(drawingServiceSpy.undoAction).toHaveBeenCalled();
    });
    it('should call redo method on control+shift+z keydown', () => {
        spyOn(component, 'redo').and.callThrough();
        const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true });
        document.dispatchEvent(event);
        expect(drawingServiceSpy.redoAction).toHaveBeenCalled();
    });
    it('should call undo method on control+z keydown', () => {
        spyOn(component, 'isSquare').and.callThrough();
        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        document.dispatchEvent(event);
        expect(drawingServiceSpy.isSquare).toHaveBeenCalled();
    });
    it('should call undo method on control+z keydown', () => {
        spyOn(component, 'notSquare').and.callThrough();
        const event = new KeyboardEvent('keyup', { key: 'Shift' });
        document.dispatchEvent(event);
        expect(drawingServiceSpy.notSquare).toHaveBeenCalled();
    });
});
