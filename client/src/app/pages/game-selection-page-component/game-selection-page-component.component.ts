import { Component } from '@angular/core';

@Component({
    selector: 'app-game-selection-page-component',
    templateUrl: './game-selection-page-component.component.html',
    styleUrls: ['./game-selection-page-component.component.scss'],
})
export class GameSelectionPageComponent {
    gameTitle1 = 'Angry Birds';
    gameTitle2 = 'DbD';
    gameTitle3 = 'Pokemon';
    gameTitle4 = 'Fortnite';
    gameImage1 = 'https://upload.wikimedia.org/wikipedia/en/4/4e/Angry_Birds_logo.svg';
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
