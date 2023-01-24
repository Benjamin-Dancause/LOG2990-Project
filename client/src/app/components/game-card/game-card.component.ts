import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
    template: `
        <div>
            <h1>{{ title }}</h1>
        </div>
    `,
    styles: [],
})
export class GameCardComponent {
    @Input() title: string;
}
