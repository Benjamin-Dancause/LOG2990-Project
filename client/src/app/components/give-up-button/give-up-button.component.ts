import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-give-up-button',
    templateUrl: './give-up-button.component.html',
    styleUrls: ['./give-up-button.component.scss'],
})
export class GiveUpButtonComponent {
    @Input() text: string;
    @Input() color: string;
}
