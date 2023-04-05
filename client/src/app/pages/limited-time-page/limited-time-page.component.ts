import { Component, OnInit } from '@angular/core';
import { CounterService } from '@app/services/counter/counter.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-limited-time-page',
    templateUrl: './limited-time-page.component.html',
    styleUrls: ['./limited-time-page.component.scss'],
})
export class LimitedTimePageComponent implements OnInit {
    gameTitle: string;
    userName: string;

    showPopup = false;

    constructor(public gameCardService: GameCardService, public socketService: SocketService, public counterService: CounterService) {}

    returnToMainMenu() {
        this.gameCardService.removePlayer(this.gameTitle, this.userName).subscribe();
        this.showPopup = false;
    }

    ngOnInit() {
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
            this.socketService.deleteRoomGameInfo();
        });
    }
}
