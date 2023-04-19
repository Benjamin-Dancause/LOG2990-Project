import { Component, HostListener } from '@angular/core';

@Component({
    selector: 'app-hints',
    templateUrl: './hints.component.html',
    styleUrls: ['./hints.component.scss'],
})
export class HintsComponent {
    nbrIndices = 3;
    multiplayer: boolean = false;
    gameMode: string = '';

    constructor() {
        this.gameMode = sessionStorage.getItem('gameMode') as string;
        const joiner = sessionStorage.getItem('joiningPlayer') as string;
        if (this.gameMode !== 'solo' && joiner) {
            this.multiplayer = true;
        }
    }

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
