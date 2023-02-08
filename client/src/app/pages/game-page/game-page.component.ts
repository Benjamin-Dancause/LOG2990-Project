import { Component, Input } from '@angular/core';
import { GameCardComponent } from '@app/components/game-card/game-card.component';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    @Input() userName: GameCardComponent["userName"];
}
