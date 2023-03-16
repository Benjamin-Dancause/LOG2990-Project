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

interface CompleteGameInfo {
    gameMaster: string;
    joiningPlayer: string;
    gameTitle: string;
    roomId: string;
}

interface PlayerSockets {
    masterSocket: Socket;
    joiningSocket?: Socket;
}

interface OneVsOneGameplayInfo {
    gameTitle: string;
    roomId: string;
    player1: boolean;
}

@WebSocketGateway()
export class TimerGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    socketIdToRoomId: Record<string, string> = {};
    roomIdToPlayerSockets = new Map<string, PlayerSockets>();
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

    @SubscribeMessage('start-OneVsOne')
    onStartOneVsOne(client: Socket) {
        const roomId = this.socketIdToRoomId[client.id];
        this.server.to(roomId).emit('redirectToGame', '/gameOneVsOne');
    }

    @SubscribeMessage('init-OneVsOne-components')
    onInitOneVsOneComponents(client: Socket, player1: boolean) {
        const roomId = [...client.rooms][1];
        if (roomId) {
            if (player1) {
                this.timerManager.startTimer(roomId);
                this.counterManager.startCounter(roomId + '_player1');
            } else {
                this.counterManager.startCounter(roomId + '_player2');
            }
        }
    }

    @SubscribeMessage('solo-game')
    onSoloGame(client: Socket) {
        const roomId = randomUUID();
        this.socketIdToRoomId[client.id] = roomId;

        if (roomId) {
            client.join(roomId);
            this.timerManager.startTimer(roomId);
            this.counterManager.startCounter(roomId + '_player1');
        }
    }

    @SubscribeMessage('handle-lobby')
    onHandleLobby(client: Socket, lobby: Lobby) {
        let roomId = '';
        if (!this.waitingRoomManager.isOtherLobby(lobby.gameTitle)) {
            roomId = randomUUID();
            console.log('line 98' + client.id);
            this.socketIdToRoomId[client.id] = roomId;

            if (roomId) {
                client.join(roomId);
                this.waitingRoomManager.createLobby(lobby.gameTitle, roomId);
                this.waitingRoomManager.initializeGameInfo(lobby.gameTitle, lobby.gameMaster);
                const incompleteSocketIds: PlayerSockets = { masterSocket: client };
                this.roomIdToPlayerSockets.set(roomId, incompleteSocketIds);
                console.log('Room Creator: ' + roomId);
                this.server.sockets.emit('awaiting-lobby', lobby.gameTitle);
            }
        } else {
            const roomToJoin = this.waitingRoomManager.joinLobby(lobby.gameTitle);
            if (roomToJoin) {
                client.join(roomToJoin);
                const gameInfo: GameInfo = this.waitingRoomManager.completeGameInfo(lobby.gameTitle, lobby.gameMaster);
                const completeGameInfo: CompleteGameInfo = {
                    gameMaster: gameInfo.gameMaster,
                    joiningPlayer: gameInfo.joiningPlayer,
                    gameTitle: gameInfo.gameTitle,
                    roomId: roomToJoin,
                };
                const initialSockets: PlayerSockets = this.roomIdToPlayerSockets.get(roomToJoin);
                const socketInfo: PlayerSockets = { masterSocket: initialSockets.masterSocket, joiningSocket: client };
                console.log('line 123 ' + socketInfo.joiningSocket);
                this.roomIdToPlayerSockets.set(roomToJoin, socketInfo);
                console.log('Master socket: ' + socketInfo.masterSocket.id + '\n' + 'Joiner socket: ' + socketInfo.joiningSocket.id);
                this.server.to(roomToJoin).emit('lobby-created', completeGameInfo);
                this.server.sockets.emit('completed-lobby', lobby.gameTitle);
            }
        }
    }

    @SubscribeMessage('increment-counter')
    handleIncrementCounter(client: Socket, player1: boolean) {
        const roomId = [...client.rooms][1];
        console.log('Value of player 1: ' + player1);
        if (roomId) {
            if (player1) {
                const counter: number = this.counterManager.incrementCounter(roomId + '_player1');
                console.log('New count for client "' + client.id + '" is : ' + counter);
                this.server.to(roomId).emit('counter-update', counter);
            } else {
                const counter: number = this.counterManager.incrementCounter(roomId + '_player2');
                console.log('New count for client "' + client.id + '" is : ' + counter);
                this.server.to(roomId).emit('counter-update', counter);
            }
        }
    }

    @SubscribeMessage('reject-player')
    onRejectPlayer(client: Socket, lobby: Lobby) {
        const roomId = this.socketIdToRoomId[client.id];
        console.log('line 143 ' + roomId);
        const socketInfo = this.roomIdToPlayerSockets.get(roomId);
        const socketToReject: Socket = socketInfo.joiningSocket;
        if (socketToReject) {
            this.server.to(socketToReject.id).emit('rejection', '/game-selection');
            this.waitingRoomManager.createLobby(lobby.gameTitle, roomId);
            this.waitingRoomManager.initializeGameInfo(lobby.gameTitle, lobby.gameMaster);
            const socketsReplace: PlayerSockets = { masterSocket: client };
            this.roomIdToPlayerSockets.set(roomId, socketsReplace);
            socketToReject.leave(roomId);
            this.server.sockets.emit('awaiting-lobby', lobby.gameTitle);
        }
    }

    @SubscribeMessage('leave-lobby')
    onLeaveLobby(client: Socket, roomId: string) {
        this.server.to(roomId).emit('get-gamemaster');
    }
    @SubscribeMessage('get-OneVsOne-info')
    onHandleOneVsOneInfo(client: Socket, gameTitle: string) {
        const socketRoom = [...client.rooms][1];
        const roomId = this.socketIdToRoomId[client.id];
        if (socketRoom === roomId) {
            const gameInfo = this.waitingRoomManager.getGameplayInfo(gameTitle);
            const gameplayInfo: OneVsOneGameplayInfo = {
                gameTitle: gameInfo.gameTitle,
                roomId: socketRoom,
                player1: true,
            };
            this.server.to(client.id).emit('player-info', gameplayInfo);
        } else {
            const gameInfo = this.waitingRoomManager.getGameplayInfo(gameTitle);
            const gameplayInfo: OneVsOneGameplayInfo = {
                gameTitle: gameInfo.gameTitle,
                roomId: socketRoom,
                player1: false,
            };
            this.server.to(client.id).emit('player-info', gameplayInfo);
        }
    }

    @SubscribeMessage('master-info')
    onMasterInfo(client: Socket, lobby: Lobby) {
        const roomId = this.socketIdToRoomId[client.id];
        console.log('line 165' + roomId);
        const socketInfo = this.roomIdToPlayerSockets.get(roomId);
        if (socketInfo) {
            const socketToReject: Socket = socketInfo.joiningSocket;
            this.server.to(socketToReject.id).emit('leave', '/game-selection');
            socketToReject.leave(roomId);
            this.server.to(roomId).emit('player-left');
            this.server.sockets.emit('awaiting-lobby', lobby.gameTitle);
            this.waitingRoomManager.createLobby(lobby.gameTitle, roomId);
            this.waitingRoomManager.initializeGameInfo(lobby.gameTitle, lobby.gameMaster);
            const socketsReplace: PlayerSockets = { masterSocket: client };
            this.roomIdToPlayerSockets.set(roomId, socketsReplace);
        }
    }

    @SubscribeMessage('close-lobby')
    onCloseLobby(client: Socket, gameTitle: string) {
        const roomId = this.socketIdToRoomId[client.id];
        const socketInfo: PlayerSockets = this.roomIdToPlayerSockets.get(roomId);
        this.server.to(roomId).emit('lobby-closed', '/game-selection');
        this.roomIdToPlayerSockets.delete(roomId);
        delete this.socketIdToRoomId[client.id];
        socketInfo.masterSocket.leave(roomId);
        this.waitingRoomManager.deleteLobbyInfo(gameTitle);
        if (socketInfo.joiningSocket) {
            socketInfo.joiningSocket.leave(roomId);
        }
    }

    @SubscribeMessage('reset-counter')
    handleResetCounter(client: Socket) {
        const roomId = this.socketIdToRoomId[client.id];
        const counter = this.counterManager.resetCounter(roomId);
        this.server.emit('counter-update', counter);
    }
}
