import { CounterManagerService } from '@app/services/counter-manager/counter-manager.service';
import { TimerManagerService } from '@app/services/timer-manager/timer-manager.service';
import { forwardRef } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class TimerGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    socketIdToRoomId: Record<string, string> = {};

    constructor(
        @Inject(forwardRef(() => TimerManagerService)) private readonly timerManager: TimerManagerService,
        @Inject(CounterManagerService) private readonly counterManager: CounterManagerService,
    ) {}

    handleConnection(client: Socket) {}

    handleDisconnect(@ConnectedSocket() client: Socket) {
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
