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

    ngOnInit() {
        this.difficulty = (localStorage.getItem('difficulty') as string) || '';
    }
}
