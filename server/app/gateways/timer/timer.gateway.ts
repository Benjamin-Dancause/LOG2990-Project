import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({namespace: '/timer'})
export class TimerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  
  private timers = new Map<string, number>();
  private intervals = new Map<string, NodeJS.Timeout>();
  
  handleConnection(client: Socket) {
    const roomId = client.handshake.query.id as string;
    console.log('timer: ' + roomId);
    if(roomId){
      client.join(roomId);
      const time: number = this.getTimeFromRoom(roomId);
      this.timers.set(roomId, time);
      const intervalId = setInterval( () => {
        this.updateTimer(roomId);
      }, 1000);
      this.intervals.set(roomId, intervalId);
    }
  }
  
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const roomId = client.handshake.query.roomId as string;
    if(roomId){
      client.leave(roomId);
      this.timers.delete(roomId);
      clearInterval(this.intervals.get(roomId));
      this.intervals.delete(roomId);
    }
  }
  
  updateTimer(roomId: string) {
    this.timers.set(roomId, this.timers.get(roomId) + 1);
        this.emitTimeToRoom(roomId, this.timers.get(roomId));
  }

  emitTimeToRoom(roomId: string, time: number) {
    this.server.to(roomId).emit('timer', time);
  }
  
  getTimeFromRoom(roomId: string): number {
    return this.timers.get(roomId) || 0;
  }

  @SubscribeMessage('reset-timer')
  onReset(client: Socket, roomId: string){
    const time = 0;
    this.timers.set(roomId, time);
    client.disconnect();
  }

}
