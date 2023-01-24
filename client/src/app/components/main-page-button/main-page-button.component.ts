import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-main-page-button',
    templateUrl: './main-page-button.component.html',
    styleUrls: ['./main-page-button.component.scss'],
})
export class MainPageButtonComponent implements OnInit {
    @Input()
    text: string;

    constructor() {}

    ngOnInit(): void {}
}
