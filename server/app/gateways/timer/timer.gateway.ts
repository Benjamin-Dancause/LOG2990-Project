import { CounterManagerService } from '@app/services/counter-manager/counter-manager.service';
import { TimerManagerService } from '@app/services/timer-manager/timer-manager.service';
import { forwardRef } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class TimerGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(
        @Inject(forwardRef(() => TimerManagerService)) private readonly timerManager: TimerManagerService,
        @Inject(CounterManagerService) private readonly counterManager: CounterManagerService,
    ) {}

    handleConnection(client: Socket) {
        const roomId = client.handshake.query.id as string;
        console.log('handleConnection line 19', client.id, roomId);

        if (roomId) {
            client.join(roomId);
            console.log('Counter roomID for handleConnection in Gateway: ' + roomId);
            this.timerManager.startTimer(roomId);
            this.counterManager.startCounter(roomId);
        }
    }

    handleDisconnect(@ConnectedSocket() client: Socket) {
        const roomId = client.handshake.query.id as string;
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

    @SubscribeMessage('increment-counter')
    handleIncrementCounter(client: Socket, roomId: string) {
        console.log(client, roomId);

        console.log('This is my room id in incrementCounter for gateway:' + roomId);
        const counter: number = this.counterManager.incrementCounter(roomId);
        console.log('counter received by manager: ' + counter);
        this.server.emit('counter-update', counter);
    }

    @SubscribeMessage('resetCounter')
    handleResetCounter(client: Socket) {
        const counter = this.counterManager.resetCounter(client);
        this.server.emit('counter-update', counter);
    }
}
