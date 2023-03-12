import { TimerManagerService } from '@app/services/timer-manager/timer-manager.service';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class TimerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  
  
  private timerManager: TimerManagerService;
  
  handleConnection(client: Socket) {
    const roomId = client.handshake.query.id as string;
    console.log('timer: ' + roomId);
    if(roomId){
      client.join(roomId);
      console.log('1');
      this.timerManager.startTimer(roomId);
    }
  }
  
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const roomId = client.handshake.query.roomId as string;
    if(roomId){
      client.leave(roomId);
      this.timerManager.deleteTimerData(roomId);
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

}
