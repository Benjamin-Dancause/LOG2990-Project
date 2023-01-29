import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-previous-next-button',
    templateUrl: './previous-next-button.component.html',
    styleUrls: ['./previous-next-button.component.scss'],
})
export class PreviousNextButtonComponent {
    @Input() showBackButton: boolean;
    @Input() showNextButton: boolean;

    @Output() back = new EventEmitter<void>();
    @Output() next = new EventEmitter<void>();

    onBack() {
        this.back.emit();
    }

    onNext() {
        this.next.emit();
    }
}
