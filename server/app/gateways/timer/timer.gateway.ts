import { TimerManagerService } from '@app/services/timer-manager/timer-manager.service';
import { forwardRef } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class TimerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(@Inject(forwardRef(() => TimerManagerService)) private readonly timerManager: TimerManagerService) {};
  
  handleConnection(client: Socket) {
    const roomId = client.handshake.query.id as string;
    console.log('timer: ' + roomId);
    if(roomId){
      client.join(roomId);
      this.timerManager.startTimer(roomId);
    }
  }
  
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const roomId = client.handshake.query.id as string;
    if(roomId){
      client.leave(roomId);
      this.timerManager.deleteTimerData(roomId);
    }
  }

  emitTimeToRoom(roomId: string, time: number) {
    console.log(roomId + '/' + time);
    this.server.to(roomId).emit('timer', time);
}

  @SubscribeMessage('reset-timer')
  onReset(client: Socket, roomId: string){
    this.timerManager.resetTimer(roomId);
    client.disconnect();
  }

}
