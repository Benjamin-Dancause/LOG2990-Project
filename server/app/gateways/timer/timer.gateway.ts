import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class TimerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  
  private timers = new Map<string, number>();
  
  handleConnection(client: Socket) {
    const roomId = client.handshake.query.roomId;
    if(roomId){
      client.join(roomId);
      const time: number = this.getTimeFromRoom(roomId);
      this.timers.set(roomId, time);
      this.emitTimeToRoom(roomId, time);
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const roomId = client.handshake.query.roomId;
    if(roomId){
      client.leave(roomId);
      this.timers.delete(roomId);
    }
  }

  @SubscribeMessage('get-time')
  onTimer(client: any, data: any){
    this.time++;
    this.server.emit('timer', this.time);
  }

  @SubscribeMessage('reset-timer')
  onReset(client: any, data: any){
    this.time = 0;
    this.server.emit('reset', this.time);
  }

}
