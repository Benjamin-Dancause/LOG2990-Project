import { Component, OnInit } from '@angular/core';
import { CommunicationService } from '@app/services/communication/communication.service';
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

    constructor(
        public gameCardService: GameCardService,
        public socketService: SocketService,
        public counterService: CounterService,
        public communication: CommunicationService,
    ) {}

    returnToMainMenu() {
        this.gameCardService.removePlayer(this.gameTitle, this.userName).subscribe();
        this.showPopup = false;
    }

    ngOnInit() {
        this.gameTitle = sessionStorage.getItem('gameTitle') as string;
        this.userName = sessionStorage.getItem('userName') as string;
        const gameMode = sessionStorage.getItem('gameMode') as string;
        const otherPlayer = sessionStorage.getItem('joiningPlayer') as string;
        if (otherPlayer) {
            this.socketService.initOneVsOneComponents(true, gameMode);
        } else {
            this.socketService.soloGame(gameMode);
        }
        this.communication.getGameNames().subscribe((games) => {
            games = this.shuffleGames(games);
            this.socketService.initializeGame(games);
        });
    }
    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngAfterViewInit() {
        this.socketService.socket.on('send-victorious-player', () => {
            this.showPopup = true;
            this.socketService.deleteRoomGameInfo();
        });
    }

    shuffleGames(names: string[]): string[] {
        let length = names.length;
        while (length) {
            const random = Math.floor(Math.random() * length--);
            [names[length], names[random]] = [names[random], names[length]];
        }
        return names;
    }
}
