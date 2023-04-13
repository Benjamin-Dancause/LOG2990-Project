import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';
import { CompleteGameInfo } from '@common/game-interfaces';

@Component({
    selector: 'app-waiting-room-limited-page',
    templateUrl: './waiting-room-limited-page.component.html',
    styleUrls: ['./waiting-room-limited-page.component.scss'],
})
export class WaitingRoomLimitedPageComponent implements OnInit, AfterViewInit {
    inputName: string = '';
    isLoading: boolean;
    gameTitle: string = '';
    gameMaster: string = '';
    joiningPlayer: string = '';
    awaitingPlayer: boolean = false;
    roomId: string = '';

    constructor(public socketService: SocketService, public router: Router) {}

    ngOnInit(): void {
        this.isLoading = true;
        this.inputName = sessionStorage.getItem('userName') as string;
        this.gameTitle = sessionStorage.getItem('gameTitle') as string;
        this.socketService.handleLobby(this.inputName, this.gameTitle);
    }
    ngAfterViewInit(): void {
        this.socketService.socket.on('lobby-created', (gameInfo: CompleteGameInfo) => {
            this.gameMaster = gameInfo.gameMaster;
            sessionStorage.setItem('gameMaster', this.gameMaster);
            this.joiningPlayer = gameInfo.joiningPlayer;
            sessionStorage.setItem('joiningPlayer', this.joiningPlayer);
            this.roomId = gameInfo.roomId;
            sessionStorage.setItem('roomId', this.roomId);
            this.awaitingPlayer = true;
        });

        this.socketService.socket.on('redirectToGame', (url) => {
            this.router.navigate([url]);
        });
    }
    startLimitedTimeGame(): void {}

    leaveLobby() {
        this.socketService.closeLobby(this.gameTitle);
        this.router.navigate(['/home']);
    }
}
