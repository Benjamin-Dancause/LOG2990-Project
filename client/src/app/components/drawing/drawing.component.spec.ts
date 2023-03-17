import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';

import { DrawingComponent } from './drawing.component';

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let fixture: ComponentFixture<DrawingComponent>;

    beforeEach(async () => {
        drawingServiceSpy = jasmine.createSpyObj(['register', 'registerBackground', 'start', 'execute', 'end', 'unregister']);
        await TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should register on creation', () => {
        spyOn(component, 'ngAfterViewInit').and.callThrough();
        component.ngAfterViewInit();
        expect(drawingServiceSpy.register).toHaveBeenCalled();
        expect(drawingServiceSpy.registerBackground).toHaveBeenCalled();
    });
    it('should start the drawing when the mouse is clicked', () => {
        spyOn(component, 'onMouseDown').and.callThrough();
        const position = 100;
        const mockClick = new MouseEvent('mousedown', {
            clientX: position,
            clientY: position,
        });
        component.onMouseDown(mockClick);
        expect(drawingServiceSpy.start).toHaveBeenCalled();
    });
    it('should execute the action when the mouse moves', () => {
        spyOn(component, 'onMouseMove').and.callThrough();
        const position = 100;
        const mockClick = new MouseEvent('mousemove', {
            clientX: position,
            clientY: position,
        });
        component.onMouseMove(mockClick);
        expect(drawingServiceSpy.execute).toHaveBeenCalled();
    });
    it('should stop drawing when the mouse is not clicked', () => {
        spyOn(component, 'onMouseUp').and.callThrough();
        const position = 100;
        const mockClick = new MouseEvent('mouseup', {
            clientX: position,
            clientY: position,
        });
        component.onMouseUp(mockClick);
        expect(drawingServiceSpy.end).toHaveBeenCalled();
    });
    it('should unregister on destroy', () => {
        spyOn(component, 'ngOnDestroy').and.callThrough();
        component.ngOnDestroy();
        expect(drawingServiceSpy.unregister).toHaveBeenCalled();
    });
    afterEach(() => {
        fixture.destroy();
    });
});
