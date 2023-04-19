import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
    @Input() difficulty: string;
    @Input() mode: string;
    @Input() total: string;
    @Input() penalty: string;
    @Input() single: string;
    @Input() solo: boolean;

    multiplayer: boolean = false;
    gameMode: string = '';

    ngOnInit() {
        this.difficulty = sessionStorage.getItem('difficulty') as string;
        this.gameMode = sessionStorage.getItem('gameMode') as string;
        const joiner = sessionStorage.getItem('joiningPlayer') as string;
        if (this.gameMode !== 'solo' && joiner) {
            this.multiplayer = true;
        }
    }
}
