import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-game-difficulty-level',
    templateUrl: './game-difficulty-level.component.html',
    styleUrls: ['./game-difficulty-level.component.scss'],
})
export class GameDifficultyLevelComponent {
    @Input() level: string;

    get color() {
        switch (this.level) {
            case 'easy':
                return 'green';
            case 'hard':
                return 'red';
            default:
                return 'gray';
        }
    }
}
