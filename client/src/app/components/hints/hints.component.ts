import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-hints',
    templateUrl: './hints.component.html',
    styleUrls: ['./hints.component.scss'],
})
export class HintsComponent {
    nbrIndices = 3;

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

    onIndexClick() {
        const event = new KeyboardEvent('keydown', { key: 'i' });
        document.dispatchEvent(event);
    }
}
