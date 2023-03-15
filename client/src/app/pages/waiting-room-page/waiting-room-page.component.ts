import { AfterViewInit, Component, OnInit } from '@angular/core';
import { WaitingRoomService } from '@app/services/waiting-room.service';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit, AfterViewInit {
    public gameMaster: string = '';
    public joiningPlayer: string = '';
    public gameTitle: string = '';

    constructor(public waitingRoomService: WaitingRoomService) {}

    ngOnInit(): void {
        this.gameMaster = localStorage.getItem('1v1username') as string;
        this.gameTitle = localStorage.getItem('gameTitle') as string;
        console.log('this was the player: ' + this.gameMaster);
        console.log('this was the chosen game: ' + this.gameTitle);
        this.waitingRoomService.handleLobby(this.gameMaster, this.gameTitle);
    }

    ngAfterViewInit(): void {
        this.waitingRoomService.socket.on('lobby-created', (roomId: string) => {
            console.log('You are in room: ' + roomId);
        });
    }
}
