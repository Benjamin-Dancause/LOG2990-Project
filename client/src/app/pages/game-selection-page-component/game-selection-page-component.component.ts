import { Component } from '@angular/core';

@Component({
    selector: 'app-game-selection-page-component',
    templateUrl: './game-selection-page-component.component.html',
    styleUrls: ['./game-selection-page-component.component.scss'],
})
export class GameSelectionPageComponent {
    gameTitle = 'Angry Birds';
}

/* import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-game-selection-page-component',
    templateUrl: './game-selection-page-component.component.html',
    styleUrls: ['./game-selection-page-component.component.scss'],
})
export class GameSelectionPageComponentComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}
}
*/
