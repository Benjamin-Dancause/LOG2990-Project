import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WaitingRoomService } from '@app/services/waiting-room.service';

interface CompleteGameInfo {
    gameMaster: string;
    joiningPlayer: string;
    gameTitle: string;
    roomId: string;
}

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit, AfterViewInit {
    public inputName: string = '';
    public gameMaster: string = '';
    public joiningPlayer: string = '';
    public gameTitle: string = '';
    protected awaitingPlayer: boolean = false;
    protected roomId: string = '';

    constructor(public waitingRoomService: WaitingRoomService, private router: Router) {}

    ngOnInit(): void {
        this.inputName = localStorage.getItem('1v1username') as string;
        this.gameTitle = localStorage.getItem('gameTitle') as string;
        console.log('this was the player: ' + this.inputName);
        console.log('this was the chosen game: ' + this.gameTitle);
        this.waitingRoomService.handleLobby(this.inputName, this.gameTitle);
    }

    ngAfterViewInit(): void {
        this.waitingRoomService.socket.on('lobby-created', (gameInfo: CompleteGameInfo) => {
            console.log(
                'Info for the room, GameMaster: ' +
                    gameInfo.gameMaster +
                    ', joiningPlayer: ' +
                    gameInfo.joiningPlayer +
                    ', gameTitle: ' +
                    gameInfo.gameTitle,
            );

            this.gameMaster = gameInfo.gameMaster;
            this.joiningPlayer = gameInfo.joiningPlayer;
            this.roomId = gameInfo.roomId;
            this.awaitingPlayer = true;
        });

        this.waitingRoomService.socket.on('redirectToGame', (url) => {
            this.router.navigate([url]);
        });

        this.waitingRoomService.socket.on('rejection', (url) => {
            console.log('You have been kicked by player');
            this.router.navigate([url]);
        });

        this.waitingRoomService.socket.on('leave', (url) => {
            this.router.navigate([url]);
        });

        this.waitingRoomService.socket.on('lobby-closed', (url) => {
            this.router.navigate([url]);
        });

        this.waitingRoomService.socket.on('get-gamemaster', (url) => {
            this.waitingRoomService.sendMasterInfo(this.inputName, this.gameTitle);
        });
    }

    isPlayerJoin(): boolean {
        return this.inputName === this.gameMaster ? true : false;
    }

    rejectPlayer() {
        this.waitingRoomService.rejectPlayer(this.inputName, this.gameTitle);
        this.router.navigate([this.router.url]);
        this.awaitingPlayer = false;
    }

    incomingPlayer() {
        return this.awaitingPlayer && this.gameMaster === this.inputName ? true : false;
    }

    leaveLobby() {
        if (this.inputName !== this.joiningPlayer) {
            this.waitingRoomService.closeLobby(this.gameTitle);
        }

        this.waitingRoomService.leaveLobby(this.roomId);
    }

    startOneVsOneGame() {
        this.waitingRoomService.startOneVsOneGame();
    }
}
