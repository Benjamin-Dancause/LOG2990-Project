import { Component, EventEmitter, HostListener, Output } from '@angular/core';

@Component({
    selector: 'app-hints',
    templateUrl: './hints.component.html',
    styleUrls: ['./hints.component.scss'],
})
export class HintsComponent {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Output() buttonClicked: EventEmitter<any> = new EventEmitter<any>();

    nbrIndices = 3;
    data: boolean;

    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent): void {
        if (event.key === 'i') {
            this.decrementCounter();
        }
    }

    decrementCounter(): void {
        if (this.nbrIndices > 0) {
            this.nbrIndices--;
        }
    }
    onClick() {
        const value = 'valeur du bouton';
        this.buttonClicked.emit(value);
    }

    onButtonClicked() {
        this.buttonClicked.emit(this.data);
    }
}
