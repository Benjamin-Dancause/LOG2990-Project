import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-top-bar',
    templateUrl: './top-bar.component.html',
    styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent implements OnInit {
    @Input() name: string;
    @Input() single: boolean;
    userName: string;

    ngOnInit() {
        const storedUserName = sessionStorage.getItem('userName');
        this.userName = storedUserName ? storedUserName : '';
        this.name = (sessionStorage.getItem('gameTitle') as string) || '';
    }
}
