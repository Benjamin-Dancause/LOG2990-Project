import { CounterManagerService } from '@app/services/counter-manager/counter-manager.service';
import { TimerManagerService } from '@app/services/timer-manager/timer-manager.service';
import { forwardRef } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class TimerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(@Inject(forwardRef(() => TimerManagerService)) private readonly timerManager: TimerManagerService,
              @Inject(CounterManagerService) private readonly counterManager: CounterManagerService) {};
  
  handleConnection(client: Socket) {
    const roomId = client.handshake.query.id as string;
    console.log('timer: ' + roomId);
    if(roomId){
      client.join(roomId);
      this.timerManager.startTimer(roomId);
      this.counterManager.startCounter(roomId);
    }
  }
  
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const roomId = client.handshake.query.id as string;
    if(roomId){
      client.leave(roomId);
      this.timerManager.deleteTimerData(roomId);
      this.counterManager.deleteCounterData(roomId);
    }
  }

  emitTimeToRoom(roomId: string, time: number) {
    this.server.to(roomId).emit('timer', time);
}

  @SubscribeMessage('reset-timer')
  onReset(client: Socket, roomId: string){
    this.timerManager.resetTimer(roomId);
    client.disconnect();
  }

  @SubscribeMessage('incrementCounter')
  handleIncrementCounter(client: Socket) {
    const counter = this.counterManager.incrementCounter(client);
    this.server.emit('counterUpdate', counter);
  }

  @SubscribeMessage('resetCounter')
  handleResetCounter(client: Socket) {
    const counter = this.counterManager.resetCounter(client);
    this.server.emit('counterUpdate', counter);
  }

}
