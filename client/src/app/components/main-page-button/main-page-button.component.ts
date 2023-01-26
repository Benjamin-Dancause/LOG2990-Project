import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-main-page-button',
    templateUrl: './main-page-button.component.html',
    styleUrls: ['./main-page-button.component.scss'],
})
export class MainPageButtonComponent {
    @Input()
    text: string;
}
