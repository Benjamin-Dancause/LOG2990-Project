import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { SliderComponent } from './slider.component';

const DEFAULT_1 = 0;
const DEFAULT_2 = 3;
const DEFAULT_3 = 9;
const DEFAULT_4 = 15;

describe('SliderComponent', () => {
    let component: SliderComponent;
    let fixture: ComponentFixture<SliderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SliderComponent],
            imports: [MatSliderModule, MatFormFieldModule, MatInputModule],
        }).compileComponents();
        fixture = TestBed.createComponent(SliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have steps array with default values', () => {
        expect(component.steps).toEqual([DEFAULT_1, DEFAULT_2, DEFAULT_3, DEFAULT_4]);
    });

    it('should have a stepIndex with default value of 1', () => {
        expect(component.stepIndex).toEqual(1);
    });

    it('should have finalValue with default value of step[stepIndex]', () => {
        expect(component.finalValue).toEqual(component.steps[component.stepIndex]);
    });

    it('should update finalValue when input change occur', () => {
        const nouveauIndex = 2;
        component.onInputChange({ value: nouveauIndex });
        expect(component.finalValue).toEqual(component.steps[nouveauIndex]);
    });
});
