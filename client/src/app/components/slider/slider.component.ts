import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-slider',
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit {
    constructor() {}
    ngOnInit(): void {}

    steps: number[] = [0, 3, 9, 15];
    stepIndex: number = 1;
    finalValue: number = this.steps[this.stepIndex];
    onInputChange($event: any) {
        this.stepIndex = +$event.value;
        this.finalValue = this.steps[this.stepIndex];
    }
}
