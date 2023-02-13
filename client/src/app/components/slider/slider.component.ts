import { Component } from '@angular/core';

const DEFAULT_1 = 0;
const DEFAULT_2 = 3;
const DEFAULT_3 = 9;
const DEFAULT_4 = 15;

@Component({
    selector: 'app-slider',
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.scss'],
})
export class SliderComponent {
    steps: number[] = [DEFAULT_1, DEFAULT_2, DEFAULT_3, DEFAULT_4];
    stepIndex: number = 1;
    finalValue: number = this.steps[this.stepIndex];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onInputChange($event: any) {
        this.stepIndex = +$event.value;
        this.finalValue = this.steps[this.stepIndex];
    }
}
