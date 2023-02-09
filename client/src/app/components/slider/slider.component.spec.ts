import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderComponent } from './slider.component';

describe('SliderComponent', () => {
    let component: SliderComponent;
    let fixture: ComponentFixture<SliderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SliderComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(SliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // nombres magiques... à changer
    it('should have steps array with default values', () => {
        expect(component.steps).toEqual([0, 3, 9, 15]);
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
