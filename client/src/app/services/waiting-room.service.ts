import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class WaitingRoomService {
    private readonly baseUrl: string = environment.webSocketUrl;
    public socket: Socket;

    constructor() {}
    initializeSocket(): void {
        if (this.socket) {
            this.socket.connect();
            return;
        }
        this.socket = io(this.baseUrl);
        console.log('This is the uniqueID for socket: ' + this.socket.id);
        this.socket.on('counter-update', (counter: number) => {
            console.log('I entered the observable return');
        });
    }

    soloGame(): void {
        this.socket.emit('solo-game');
    }

    handleLobby(name: string, gameTitle: string): void {
        this.socket.emit('handle-lobby', { gameMaster: name, gameTitle: gameTitle });
    }

    startOneVsOneGame() {
        this.socket.emit('start-OneVsOne');
    }

    rejectPlayer(name: string, gameTitle: string) {
        this.socket.emit('reject-player', { gameMaster: name, gameTitle: gameTitle });
    }

    disconnectSocket() {
        this.socket.disconnect();
    }
}
