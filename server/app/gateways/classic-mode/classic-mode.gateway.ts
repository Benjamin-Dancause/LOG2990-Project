/* eslint-disable no-console */
import { ClickResponse } from '@app/classes/click-response';
import { Coords } from '@app/classes/coords';
import { CounterManagerService } from '@app/services/counter-manager/counter-manager.service';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { StoreService } from '@app/services/store/store.service';
import { TimerManagerService } from '@app/services/timer-manager/timer-manager.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager/waiting-room-manager.service';
import { CompleteGameInfo, DifferenceInterface, GameInfo, Lobby, OneVsOneGameplayInfo } from '@common/game-interfaces';
import { forwardRef } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { ConnectedSocket, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';

interface PlayerSockets {
    masterSocket: Socket;
    joiningSocket?: Socket;
}

@WebSocketGateway()
export class ClassicModeGateway implements OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    socketIdToRoomId: Record<string, string> = {};
    roomIdToPlayerSockets = new Map<string, PlayerSockets>();

    constructor(
        @Inject(forwardRef(() => TimerManagerService)) private readonly timerManager: TimerManagerService,
        @Inject(CounterManagerService) private readonly counterManager: CounterManagerService,
        @Inject(WaitingRoomManagerService) private readonly waitingRoomManager: WaitingRoomManagerService,
        @Inject(GameManager) private readonly gameManager: GameManager,
        @Inject(StoreService) private readonly storeService: StoreService,
    ) {}

    @SubscribeMessage('reset-timer')
    onReset(client: Socket, roomId: string) {
        this.timerManager.resetTimer(roomId);
        client.disconnect();
    }

    @SubscribeMessage('start-OneVsOne')
    onStartOneVsOne(client: Socket) {
        const roomId = [...client.rooms][1];
        this.server.to(roomId).emit('redirectToGame', '/gameOneVsOne');
    }

    @SubscribeMessage('init-OneVsOne-components')
    onInitOneVsOneComponents(client: Socket, lobbyInfo: { player1: boolean; gameMode: string }) {
        const roomId = [...client.rooms][1];
        if (roomId) {
            if (lobbyInfo.gameMode === 'tl') {
                this.timerManager.startTimer(roomId, lobbyInfo.gameMode);
                this.counterManager.startCounter(roomId + '_player1');
            } else {
                if (lobbyInfo.player1) {
                    this.timerManager.startTimer(roomId, lobbyInfo.gameMode);
                    this.counterManager.startCounter(roomId + '_player1');
                } else {
                    this.counterManager.startCounter(roomId + '_player2');
                }
            }
        }
    }

    @SubscribeMessage('solo-game')
    onSoloGame(client: Socket, gameMode: string) {
        const roomId = randomUUID();
        this.socketIdToRoomId[client.id] = roomId;
        if (roomId) {
            client.join(roomId);
            this.timerManager.startTimer(roomId, gameMode);
            this.counterManager.startCounter(roomId + '_player1');
        }
    }

    @SubscribeMessage('add-to-timer')
    onAddToTimer(client: Socket) {
        const roomId = [...client.rooms][1];
        if (roomId) {
            this.timerManager.addToTimer(roomId);
        }
    }

    @SubscribeMessage('remove-to-timer')
    onRemoveToTimer(client: Socket) {
        const roomId = [...client.rooms][1];
        if (roomId) {
            this.timerManager.removeToTimer(roomId);
        }
    }

    @SubscribeMessage('leave-game')
    onLeaveGame(client: Socket) {
        const roomId = [...client.rooms][1];
        if (roomId) {
            this.timerManager.deleteTimerData(roomId);
            this.server.to(roomId).emit('player-quit-game');
        }
    }
    @SubscribeMessage('leave-limited-time')
    onLeftlimitedTime(client: Socket) {
        const roomId = [...client.rooms][1];
        if (roomId) {
            this.server.to(roomId).emit('player-quit-game');
        }
    }

    @SubscribeMessage('delete-game')
    onDeleteGame(client: Socket, gameTitle: string) {
        this.server.emit('game-deleted', gameTitle);
    }

    @SubscribeMessage('handle-lobby')
    onHandleLobby(client: Socket, lobby: Lobby) {
        let roomId = '';
        if (!this.waitingRoomManager.isOtherLobby(lobby.gameTitle)) {
            roomId = randomUUID();
            this.socketIdToRoomId[client.id] = roomId;

            if (roomId) {
                client.join(roomId);
                this.waitingRoomManager.createLobby(lobby.gameTitle, roomId);
                this.waitingRoomManager.initializeGameInfo(lobby.gameTitle, lobby.gameMaster);
                const incompleteSocketIds: PlayerSockets = { masterSocket: client };
                this.roomIdToPlayerSockets.set(roomId, incompleteSocketIds);
                this.server.emit('awaiting-lobby', lobby.gameTitle);
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
                this.roomIdToPlayerSockets.set(roomToJoin, socketInfo);
                this.server.to(roomToJoin).emit('lobby-created', completeGameInfo);
                this.server.emit('completed-lobby', lobby.gameTitle);
                if (lobby.gameTitle === 'Temps Limité') {
                    this.server.to(roomToJoin).emit('redirectToGame', '/limited-time');
                }
            }
        }
    }

    @SubscribeMessage('increment-counter')
    handleIncrementCounter(client: Socket, player1: boolean) {
        const roomId = [...client.rooms][1];
        if (roomId) {
            if (player1) {
                const counter: number = this.counterManager.incrementCounter(roomId + '_player1');
                this.server.to(roomId).emit('counter-update', { counter, player1 });
            } else {
                const counter: number = this.counterManager.incrementCounter(roomId + '_player2');
                this.server.to(roomId).emit('counter-update', { counter, player1 });
            }
        }
    }

    @SubscribeMessage('send-difference-found')
    onDifferenceFound(client: Socket, response: ClickResponse) {
        const roomId = [...client.rooms][1];
        if (roomId) {
            this.server.to(roomId).emit('update-difference', response);
        }
    }

    @SubscribeMessage('send-player-message')
    onSendPlayerMessage(client: Socket, messageInfo: { name: string; message: string }) {
        const roomId = [...client.rooms][1];
        if (roomId) {
            this.server.to(roomId).emit('incoming-player-message', messageInfo);
        }
    }

    @SubscribeMessage('send-player-error')
    onSendPlayerError(client: Socket, name: string) {
        const roomId = [...client.rooms][1];
        if (roomId) {
            this.server.to(roomId).emit('player-error', name);
        }
    }

    @SubscribeMessage('send-player-success')
    onSendPlayerSuccess(client: Socket, name: string) {
        const roomId = [...client.rooms][1];
        if (roomId) {
            this.server.to(roomId).emit('player-success', name);
        }
    }

    @SubscribeMessage('send-new-record')
    onNewRecordSet(client: Socket, recordInfo: { name: string; position: string; title: string; mode: string }) {
        const rooms = this.gameManager.getAllRooms();
        for (const room of rooms) {
            this.server.to(room).emit('new-record', recordInfo);
        }
    }

    @SubscribeMessage('reject-player')
    onRejectPlayer(client: Socket, lobby: Lobby) {
        const roomId = this.socketIdToRoomId[client.id];
        const socketInfo = this.roomIdToPlayerSockets.get(roomId);
        const socketToReject: Socket = socketInfo.joiningSocket;
        if (socketToReject) {
            this.server.to(socketToReject.id).emit('rejection', '/game-selection');
            this.waitingRoomManager.createLobby(lobby.gameTitle, roomId);
            this.waitingRoomManager.initializeGameInfo(lobby.gameTitle, lobby.gameMaster);
            const socketsReplace: PlayerSockets = { masterSocket: client };
            this.roomIdToPlayerSockets.set(roomId, socketsReplace);
            socketToReject.leave(roomId);
            this.server.emit('awaiting-lobby', lobby.gameTitle);
        }
    }

    @SubscribeMessage('leave-lobby')
    onLeaveLobby(client: Socket) {
        const roomId = [...client.rooms][1];
        this.server.to(roomId).emit('player-left');
        client.leave(roomId);
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

    @SubscribeMessage('reset-lobby')
    onResetLobby(client: Socket, lobby: Lobby) {
        const roomId = [...client.rooms][1];
        if (roomId) {
            this.waitingRoomManager.createLobby(lobby.gameTitle, roomId);
            this.waitingRoomManager.initializeGameInfo(lobby.gameTitle, lobby.gameMaster);
            this.server.emit('awaiting-lobby', lobby.gameTitle);
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
    handleResetCounter(client: Socket, player1: boolean) {
        const roomId = [...client.rooms][1];
        if (roomId) {
            if (player1) {
                const counter = this.counterManager.resetCounter(roomId + '_player1');
                this.server.to(roomId).emit('counter-update', { counter, player1 });
            } else {
                const counter = this.counterManager.resetCounter(roomId + '_player2');
                this.server.to(roomId).emit('counter-update', { counter, player1 });
            }
        }
    }

    @SubscribeMessage('on-victory-sequence')
    handleVictorySequence(client: Socket, player1: boolean) {
        const roomId = [...client.rooms][1];
        if (roomId) {
            this.server.to(roomId).emit('new-record-time', this.timerManager.getTimeFromRoom(roomId, ''));
            this.timerManager.deleteTimerData(roomId);
            this.server.to(roomId).emit('send-victorious-player', player1);
        }
    }

    @SubscribeMessage('initialize-game')
    async onInitializeGame(client: Socket, gameTitles: string[]) {
        const roomId = [...client.rooms][1];
        const images = await this.gameManager.loadGame(roomId, gameTitles);
        this.server.to(roomId).emit('switch-images', images);
    }

    @SubscribeMessage('delete-room-game-info')
    onDeleteRoomGameInfo(client: Socket) {
        const roomId = [...client.rooms][1];
        this.gameManager.deleteRoomGameInfo(roomId);
    }

    @SubscribeMessage('switch-game')
    onSwitchGame(client: Socket) {
        const roomId = [...client.rooms][1];
        if (roomId) {
            const newGameInfo = this.gameManager.switchGame(roomId);
            if (newGameInfo.length > 0) {
                this.server.to(roomId).emit('switch-images', newGameInfo);
            } else {
                this.server.to(roomId).emit('send-victorious-player', true);
                this.timerManager.deleteTimerData(roomId);
            }
        }
    }

    @SubscribeMessage('verify-position')
    onVerifyPosition(client: Socket, clickCoords: Coords) {
        const roomId = [...client.rooms][1];
        const clickResponse: DifferenceInterface = this.gameManager.verifyPosition(roomId, clickCoords);
        this.server.to(client.id).emit('click-response', clickResponse);
    }

    handleDisconnect(@ConnectedSocket() client: Socket) {
        const roomId = this.socketIdToRoomId[client.id];
        if (roomId) {
            client.leave(roomId);
            this.waitingRoomManager.deleteLobbyInfo(roomId);
            this.roomIdToPlayerSockets.delete(roomId);
        }
    }

    emitTimeToRoom(roomId: string, time: number) {
        this.server.to(roomId).emit('timer', time);
    }
}
