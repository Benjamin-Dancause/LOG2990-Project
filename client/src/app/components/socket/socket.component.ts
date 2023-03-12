import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'app-socket',
    templateUrl: './socket.component.html',
    styleUrls: ['./socket.component.scss'],
})
export class SocketComponent implements OnInit, OnDestroy {
    numClients = 0;
    numClients$: Observable<number>;
    private numClientsSub: Subscription;

    constructor(private scService: SocketClientService) {}

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.numClientsSub.unsubscribe();
        this.scService.disconnect();
    }

    onClickConnect() {
        this.scService.connect();
        this.scService.on('hello', (args) => {
            console.log(args);
        });
    }
}
