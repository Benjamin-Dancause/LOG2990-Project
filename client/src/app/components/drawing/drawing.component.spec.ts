import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';

import { DrawingComponent } from './drawing.component';

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let drawingSpy: jasmine.SpyObj<DrawingService>;
    let fixture: ComponentFixture<DrawingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            providers: [{ provide: DrawingService, useValue: drawingSpy }],
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
        expect(drawingSpy.register).toHaveBeenCalled();
    });
    afterEach(() => {
        fixture.destroy();
    });
});
