import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { ReplayService } from '@app/services/replay/replay.service';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    @ViewChild(PlayAreaComponent) playArea: PlayAreaComponent;

    gameTitle: string;
    userName: string;
    replayMode = false;
    showPopup = false;

    constructor(public gameCardService: GameCardService, public socketService: SocketService, public replayService: ReplayService) {}

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
        });
    }

    startReplay(): void {
        this.showPopup = false;
        this.replayMode = true;
        this.playArea.replay = true;
        this.playArea.initCanvases();
    }
    receiveReplayEvent() {
        this.playArea.initCanvases();
    }

    test() {
        this.replayService.playAction();
    }

    ngOnDestroy(): void {
        this.socketService.deleteRoomGameInfo();
    }
}
