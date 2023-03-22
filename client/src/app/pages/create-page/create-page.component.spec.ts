import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateImageComponent } from '@app/components/create-image/create-image.component';
import { SliderComponent } from '@app/components/slider/slider.component';
import { CreatePageComponent } from './create-page.component';

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;

    beforeEach(async () => {
        const mockContext = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillStyle', 'fillRect']);
        const canvasRef = {
            nativeElement: {
                getContext: jasmine.createSpy('getContext').and.returnValue(mockContext),
            },
        };
        const createImageComponentStub = {
            originalCanvas: canvasRef,
            modifiableCanvas: canvasRef,
        };

        await TestBed.configureTestingModule({
            imports: [MatDialogModule, HttpClientTestingModule, RouterTestingModule, MatFormFieldModule, MatInputModule, MatSliderModule],
            declarations: [CreatePageComponent, SliderComponent],
            schemas: [NO_ERRORS_SCHEMA],
            // eslint-disable-next-line @typescript-eslint/naming-convention
            providers: [{ CreateImageComponent, useValue: createImageComponentStub }],
        }).compileComponents();
        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
