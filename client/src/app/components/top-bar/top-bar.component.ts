import { Component, Input, OnInit } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-top-bar',
    templateUrl: './top-bar.component.html',
    styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent implements OnInit {
    @Input() name: string;
    @Input() single: boolean;
    userName: string;
    opponent: string = '';
    gameMode: string = '';
    isCoop: boolean = false;

    constructor(private socketService: SocketService) {}

    ngOnInit() {
        const storedUserName = sessionStorage.getItem('userName');
        this.userName = storedUserName ? storedUserName : '';
        this.name = (sessionStorage.getItem('gameTitle') as string) || '';
        this.gameMode = sessionStorage.getItem('gameMode') as string;

        this.socketService.socket.off('player-quit-game');
        this.socketService.socket.on('player-quit-game', () => {
            console.log('top bar');
            this.isCoop = false;
        });

        if (!this.single) {
            if (this.userName === (sessionStorage.getItem('gameMaster') as string)) {
                this.opponent = sessionStorage.getItem('joiningPlayer') as string;
            } else {
                this.opponent = sessionStorage.getItem('gameMaster') as string;
            }
        } else if (this.gameMode === 'tl') {
            if (this.userName === (sessionStorage.getItem('gameMaster') as string)) {
                this.opponent = sessionStorage.getItem('joiningPlayer') as string;
            } else {
                this.opponent = sessionStorage.getItem('gameMaster') as string;
            }

            if (this.opponent) {
                this.isCoop = true;
            }
        }
    }
}
