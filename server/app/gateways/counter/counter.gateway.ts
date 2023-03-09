import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({namespace: '/counter'})
export class CounterGateway {
  @WebSocketServer() server: Server;
  
  private counters: Map<string, number> = new Map();

  handleConnection(client: Socket) {
    const clientId = client.handshake.query.clientId as string;
    console.log('counter: ' + clientId);
    if(clientId){
      client.join(clientId);
      const count: number = this.getCounterFromRoom(clientId);
      this.counters.set(clientId, count);
    }
  }
  
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const clientId = client.handshake.query.clientId as string;
    if(clientId){
      client.leave(clientId);
      this.counters.delete(clientId);
    }
  }

  getCounterFromRoom(clientId: string): number {
    return this.counters.get(clientId) || 0;
  }
  
  @SubscribeMessage('incrementCounter')
  handleIncrementCounter(client: Socket) {

    this.counters.set(client.id, this.counters.get(client.id) + 1);
    const counter = this.counters.get(client.id);
    
    this.server.emit('counterUpdate', {counter});
  }

  @SubscribeMessage('resetCounter')
  handleResetCounter(client: Socket) {

    this.counters.set(client.id, 0);
    const counter = this.counters.get(client.id);

    this.server.emit('counterUpdate', {counter});
  }
}
