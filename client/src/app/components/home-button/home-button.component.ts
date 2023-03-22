import { Component, Input } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-home-button',
    templateUrl: './home-button.component.html',
    styleUrls: ['./home-button.component.scss'],
})
export class HomeButtonComponent {
    @Input() text: string;

    constructor(public socketService: SocketService) {}

    disconnectSocket() {
        this.socketService.disconnectSocket();
    }
}
