import { Component, OnInit, ViewChild } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    @ViewChild(PlayAreaComponent) playArea: PlayAreaComponent;

    gameTitle: string;
    userName: string;
    replayMode = false;
    showPopup = false;

    constructor(public gameCardService: GameCardService, public socketService: SocketService) {}

    returnToMainMenu() {
        this.gameCardService.removePlayer(this.gameTitle, this.userName).subscribe();
        this.showPopup = false;
    }

    ngOnInit() {
        this.replayMode = false;
        this.gameTitle = sessionStorage.getItem('gameTitle') as string;
        this.userName = sessionStorage.getItem('userName') as string;
        const gameMode = sessionStorage.getItem('gameMode') as string;
        this.socketService.soloGame(gameMode);
        this.socketService.initializeGame([this.gameTitle]);
    }

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngAfterViewInit() {
        this.socketService.socket.on('send-victorious-player', () => {
            this.showPopup = true;
            sessionStorage.setItem('winner', 'true');
            this.socketService.deleteRoomGameInfo();
        });
    }

    startReplay(): void {
        this.showPopup = false;
        this.replayMode = true;
        this.playArea.initCanvases();
    }
}
