import { Component, Input } from '@angular/core';
import { WaitingRoomService } from '@app/services/waiting-room.service';

@Component({
    selector: 'app-home-button',
    templateUrl: './home-button.component.html',
    styleUrls: ['./home-button.component.scss'],
})
export class HomeButtonComponent {
    @Input() text: string;

    constructor(public waitingRoomService: WaitingRoomService) {}

    disconnectSocket() {
        this.waitingRoomService.disconnectSocket();
    }
}
