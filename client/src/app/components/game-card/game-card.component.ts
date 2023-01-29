import { Component, Input } from '@angular/core';

// import game-difficulty-level component

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent {
    @Input() gameTitle: string;
    @Input() imageUrl: string;

    @Input() level: string;

    @Input() configuration: boolean;

    get color() {
        switch (this.level) {
            case 'easy':
                return 'green';
            case 'hard':
                return 'red';
            default:
                return 'yellow';
        }
    }

    get levelText() {
        switch (this.level) {
            case 'easy':
                return 'Facile';
            case 'hard':
                return 'Difficile';
            default:
                return 'Moyen';
        }
    }

    onClick(link: string): void {
        // navigate or do something with the link
    }
}
