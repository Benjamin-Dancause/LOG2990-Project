import { Injectable } from '@angular/core';
import { ClickResponse } from '@app/classes/click-response';
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
    }

    soloGame(): void {
        this.socket.emit('solo-game');
    }

    oneVsOne(): void {
        this.socket.emit('one-vs-one-game');
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

    closeLobby(gameTitle: string) {
        this.socket.emit('close-lobby', gameTitle);
    }

    leaveLobby() {
        this.socket.emit('leave-lobby');
    }

    resetLobby(gameMaster: string, gameTitle: string) {
        this.socket.emit('reset-lobby', { gameMaster: gameMaster, gameTitle: gameTitle });
    }

    getGameTitle(roomId: String) {
        this.socket.emit('get-gameTitle', roomId);
    }

    assignPlayerInfo(gameTitle: string) {
        this.socket.emit('get-OneVsOne-info', gameTitle);
    }

    initOneVsOneComponents(player1: boolean) {
        this.socket.emit('init-OneVsOne-components', player1);
    }

    sendDifferenceFound(response: ClickResponse) {
        this.socket.emit('send-difference-found', response);
    }

    leaveGame() {
        this.socket.emit('leave-game');
    }

    sendPlayerMessage(name: string, message: string) {
        this.socket.emit('send-player-message', { name: name, message: message });
    }

    sendPlayerError(name: string) {
        this.socket.emit('send-player-error', name);
    }

    sendPlayerSuccess(name: string) {
        this.socket.emit('send-player-success', name);
    }

    sendVictoriousPlayer(player1: boolean) {
        this.socket.emit('on-victory-sequence', player1);
    }

    disconnectSocket() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}
