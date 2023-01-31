import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    @Input() difficulty: string;
    @Input() mode: string;
    @Input() total: string;
    @Input() penalty: string;
}
