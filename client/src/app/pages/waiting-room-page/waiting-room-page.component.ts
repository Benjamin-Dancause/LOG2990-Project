import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';
import { CompleteGameInfo } from '@common/game-interfaces';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit, AfterViewInit, OnDestroy {
    inputName: string = '';
    gameMaster: string = '';
    joiningPlayer: string = '';
    gameTitle: string = '';
    awaitingPlayer: boolean = false;
    roomId: string = '';
    isAvailable: boolean = true;
    showPopupKick: boolean = false;
    showPopupLeave: boolean = false;

    constructor(public socketService: SocketService, public router: Router, public gameCardService: GameCardService) {}

    ngOnInit(): void {
        this.inputName = sessionStorage.getItem('userName') as string;
        this.gameTitle = sessionStorage.getItem('gameTitle') as string;
        this.socketService.handleLobby(this.inputName, this.gameTitle);
    }

    ngOnDestroy(): void {
        this.showPopupKick = false;
        this.showPopupLeave = false;
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

        this.socketService.socket.on('rejection', (url) => {
            this.showPopupKick = true;
        });

        this.socketService.socket.on('player-left', () => {
            this.socketService.resetLobby(this.gameMaster, this.gameTitle);
            this.awaitingPlayer = false;
        });

        this.socketService.socket.on('lobby-closed', (url) => {
            if (this.inputName === this.joiningPlayer) {
                this.showPopupLeave = true;
            } else {
                this.router.navigate([url]);
            }
        });
    }

    isPlayerJoin(): boolean {
        return this.inputName === this.gameMaster ? true : false;
    }

    rejectPlayer() {
        this.socketService.rejectPlayer(this.inputName, this.gameTitle);
        this.router.navigate([this.router.url]);
        this.awaitingPlayer = false;
    }

    incomingPlayer() {
        return this.awaitingPlayer && this.gameMaster === this.inputName ? true : false;
    }

    leaveLobby() {
        if (this.inputName !== this.joiningPlayer) {
            this.socketService.closeLobby(this.gameTitle);
        } else {
            this.socketService.leaveLobby();
            this.router.navigate(['/game-selection']);
        }
    }

    startOneVsOneGame() {
        this.gameCardService.addPlayer(this.gameTitle, this.gameMaster).subscribe();
        this.gameCardService.addPlayer(this.gameTitle, this.joiningPlayer).subscribe();
        this.socketService.startOneVsOneGame();
    }
}
