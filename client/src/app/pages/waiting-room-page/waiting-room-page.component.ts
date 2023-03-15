import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WaitingRoomService } from '@app/services/waiting-room.service';

interface GameInfo {
    gameMaster: string;
    joiningPlayer: string;
    gameTitle: string;
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

    constructor(public waitingRoomService: WaitingRoomService, private router: Router) {}

    ngOnInit(): void {
        this.inputName = localStorage.getItem('1v1username') as string;
        this.gameTitle = localStorage.getItem('gameTitle') as string;
        console.log('this was the player: ' + this.inputName);
        console.log('this was the chosen game: ' + this.gameTitle);
        this.waitingRoomService.handleLobby(this.inputName, this.gameTitle);
    }

    ngAfterViewInit(): void {
        this.waitingRoomService.socket.on('lobby-created', (gameInfo: GameInfo) => {
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
            this.awaitingPlayer = true;
        });

        this.waitingRoomService.socket.on('redirectToGame', (url) => {
            this.router.navigate([url]);
        });

        this.waitingRoomService.socket.on('rejection', (url) => {
            this.router.navigate([url]);
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

    startOneVsOneGame() {
        this.waitingRoomService.startOneVsOneGame();
    }
}
