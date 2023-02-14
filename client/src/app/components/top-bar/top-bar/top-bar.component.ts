import { Component, Input, OnInit } from '@angular/core';
import { CounterService } from '@app/services/counter.service';

@Component({
    selector: 'app-top-bar',
    templateUrl: './top-bar.component.html',
    styleUrls: ['./top-bar.component.scss'],
    providers: [CounterService],
})
export class TopBarComponent implements OnInit {
    @Input() name: string;
    userName: string;

    ngOnInit() {
        const storedUserName = localStorage.getItem('userName');
        this.userName = storedUserName ? storedUserName : '';
    }
}
