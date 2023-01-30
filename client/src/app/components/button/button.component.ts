import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit {
    @Input() buttonName: string;
    @Output() btnClick = new EventEmitter();

    constructor() {}

    ngOnInit(): void {}

    onClick() {
        this.btnClick.emit();
    }
}
