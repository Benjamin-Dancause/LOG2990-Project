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

            console.log(this.isGameMaster());
        });

        this.waitingRoomService.socket.on('redirectToGame', (url) => {
            this.router.navigate([url]);
        });

        console.log(
            'GameInfo on client:\n GameMaster: ' +
                this.gameMaster +
                '\n' +
                'joiningPlayer: ' +
                this.joiningPlayer +
                '\n' +
                'gameTitle: ' +
                this.gameTitle +
                '\n',
        );
    }

    isGameMaster(): boolean {
        return this.inputName === this.gameMaster ? true : false;
    }

    startOneVsOneGame() {
        this.waitingRoomService.startOneVsOneGame();
    }
}
