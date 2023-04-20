import { Injectable } from '@angular/core';
import { ClickResponse } from '@app/classes/click-response';
import { Coords } from '@app/classes/coords';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    socket: Socket;
    private readonly baseUrl: string = environment.webSocketUrl;

    initializeSocket(): void {
        if (this.socket) {
            this.socket.connect();
            return;
        }
        this.socket = io(this.baseUrl);
    }

    soloGame(gameMode: string): void {
        this.socket.emit('solo-game', gameMode);
    }

    oneVsOne(): void {
        this.socket.emit('one-vs-one-game');
    }

    handleLobby(name: string, gameTitle: string): void {
        this.socket.emit('handle-lobby', { gameMaster: name, gameTitle });
    }

    startOneVsOneGame() {
        this.socket.emit('start-OneVsOne');
    }

    rejectPlayer(name: string, gameTitle: string) {
        this.socket.emit('reject-player', { gameMaster: name, gameTitle });
    }

    closeLobby(gameTitle: string) {
        this.socket.emit('close-lobby', gameTitle);
    }

    leaveLobby() {
        this.socket.emit('leave-lobby');
    }

    resetLobby(gameMaster: string, gameTitle: string) {
        this.socket.emit('reset-lobby', { gameMaster, gameTitle });
    }

    getGameTitle(roomId: string) {
        this.socket.emit('get-gameTitle', roomId);
    }

    getImages() {
        this.socket.emit('get-images');
    }

    deleteGame(gameTitle: string) {
        this.socket.emit('delete-game', gameTitle);
    }

    assignPlayerInfo(gameTitle: string) {
        this.socket.emit('get-OneVsOne-info', gameTitle);
    }

    initOneVsOneComponents(player1: boolean, gameMode: string) {
        this.socket.emit('init-OneVsOne-components', { player1, gameMode });
    }

    sendDifferenceFound(response: ClickResponse) {
        this.socket.emit('send-difference-found', response);
    }

    leaveGame() {
        this.socket.emit('leave-game');
    }

    leaveLimitedTime() {
        console.log('leave-limited-time');
        this.socket.emit('leave-limited-time');
    }

    sendPlayerMessage(name: string, message: string) {
        this.socket.emit('send-player-message', { name, message });
    }

    sendPlayerError(name: string) {
        this.socket.emit('send-player-error', name);
    }

    sendPlayerSuccess(name: string) {
        this.socket.emit('send-player-success', name);
    }

    sendNewRecord(name: string, position: string, title: string, mode: string) {
        this.socket.emit('send-new-record', { name, position, title, mode });
    }

    sendPlayerHint(name: string) {
        this.socket.emit('send-player-hint', name);
    }

    sendVictoriousPlayer(player1: boolean) {
        this.socket.emit('on-victory-sequence', player1);
    }

    resetTimer(roomId: string) {
        this.socket.emit('reset-timer', roomId);
    }

    incrementCounter(player1: boolean) {
        this.socket.emit('increment-counter', player1);
    }

    resetCounter(player1: boolean) {
        this.socket.emit('reset-counter', player1);
    }

    initializeGame(gameTitles: string[]) {
        this.socket.emit('initialize-game', gameTitles);
    }

    sendPosition(mousePosition: Coords) {
        this.socket.emit('verify-position', mousePosition);
    }

    deleteRoomGameInfo() {
        this.socket.emit('delete-room-game-info');
    }

    addToTimer() {
        this.socket.emit('add-to-timer');
    }

    removeToTimer() {
        this.socket.emit('remove-to-timer');
    }

    switchGame() {
        this.socket.emit('switch-game');
    }

    disconnectSocket() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}
