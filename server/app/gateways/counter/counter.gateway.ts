import { ConnectedSocket, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({namespace: '/counter'})
export class CounterGateway {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    const clientId = client.handshake.query.clientId as string;
    if(clientId){
      client.join(clientId);
      
    }
  }
  
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const clientId = client.handshake.query.clientId as string;
    if(clientId){
      client.leave(clientId);
      
    }
  }


  
  
}
