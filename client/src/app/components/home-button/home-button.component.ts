import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home-button',
    templateUrl: './home-button.component.html',
    styleUrls: ['./home-button.component.scss'],
})
export class HomeButtonComponent {
    @Input()
    text: string;

    constructor(private router: Router) {}

    goToHome() {
        this.router.navigate(['/home']);
    }
}
