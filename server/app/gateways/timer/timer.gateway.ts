import { CounterManagerService } from '@app/services/counter-manager/counter-manager.service';
import { TimerManagerService } from '@app/services/timer-manager/timer-manager.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager/waiting-room-manager.service';
import { forwardRef } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';

interface Lobby {
    gameMaster: string;
    gameTitle: string;
}

interface GameInfo {
    gameMaster: string;
    joiningPlayer: string;
    gameTitle: string;
}

@WebSocketGateway()
export class TimerGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    socketIdToRoomId: Record<string, string> = {};
    connectionCounter: number = 0;

    constructor(
        @Inject(forwardRef(() => TimerManagerService)) private readonly timerManager: TimerManagerService,
        @Inject(CounterManagerService) private readonly counterManager: CounterManagerService,
        @Inject(WaitingRoomManagerService) private readonly waitingRoomManager: WaitingRoomManagerService,
    ) {}

    handleConnection(client: Socket) {
        this.connectionCounter++;
        console.log('New connection, total clients connected is now: ' + this.connectionCounter);
        if (this.connectionCounter > 1) {
            this.server.sockets.emit('connection-count', 'There is now more than 1 person online');
        }
    }

    handleDisconnect(@ConnectedSocket() client: Socket) {
        this.connectionCounter--;
        console.log('New disconnection, total clients connected is now: ' + this.connectionCounter);
        const roomId = this.socketIdToRoomId[client.id];
        if (roomId) {
            client.leave(roomId);
            this.timerManager.deleteTimerData(roomId);
            this.counterManager.deleteCounterData(roomId);
        }
    }

    emitTimeToRoom(roomId: string, time: number) {
        this.server.to(roomId).emit('timer', time);
    }

    @SubscribeMessage('reset-timer')
    onReset(client: Socket, roomId: string) {
        this.timerManager.resetTimer(roomId);
        client.disconnect();
    }

    @SubscribeMessage('start-oneVsOne')
    onStartOneVsOne(client: Socket) {
        const roomId = this.socketIdToRoomId[client.id];
        this.server.to(roomId).emit('redirectToGame', '/gameOneVsOne');
    }

    @SubscribeMessage('solo-game')
    onSoloGame(client: Socket) {
        const roomId = randomUUID();
        console.log(client.id);
        this.socketIdToRoomId[client.id] = roomId;
        console.log('handleConnection line 19', client.id, roomId);

        if (roomId) {
            client.join(roomId);
            console.log('Counter roomID for handleConnection in Gateway: ' + roomId);
            this.timerManager.startTimer(roomId);
            this.counterManager.startCounter(roomId);
        }
    }

    @SubscribeMessage('handle-lobby')
    onHandleLobby(client: Socket, lobby: Lobby) {
        let roomId = '';
        if (!this.waitingRoomManager.isOtherLobby(lobby.gameTitle)) {
            roomId = randomUUID();
            console.log(client.id);
            this.socketIdToRoomId[client.id] = roomId;

            if (roomId) {
                client.join(roomId);
                this.waitingRoomManager.createLobby(lobby.gameTitle, roomId);
                this.waitingRoomManager.initializeGameInfo(lobby.gameTitle, lobby.gameMaster);
                console.log('Room Creator: ' + roomId);
            }
        } else {
            const roomToJoin = this.waitingRoomManager.joinLobby(lobby.gameTitle);
            if (roomToJoin) {
                client.join(roomToJoin);
                const gameInfo: GameInfo = this.waitingRoomManager.completeGameInfo(lobby.gameTitle, lobby.gameMaster);
                console.log('Room joiner: ' + gameInfo);
                this.server.to(roomToJoin).emit('lobby-created', gameInfo);
            }
        }
    }

    @SubscribeMessage('increment-counter')
    handleIncrementCounter(client: Socket) {
        const roomId = this.socketIdToRoomId[client.id];
        const counter: number = this.counterManager.incrementCounter(roomId);
        console.log('counter received by manager: ' + counter);
        this.server.to(roomId).emit('counter-update', counter);
    }

    @SubscribeMessage('reset-counter')
    handleResetCounter(client: Socket) {
        const roomId = this.socketIdToRoomId[client.id];
        const counter = this.counterManager.resetCounter(roomId);
        this.server.emit('counter-update', counter);
    }
}
