import { Injectable } from '@nestjs/common';
import * as http from 'http';
import * as io from 'socket.io';

@Injectable()
export class SocketManagerService {
    private sio: io.Server;
    private room: string = 'serverRoom';
    constructor(server: http.Server) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.handleSockets();
    }

    public handleSockets(): void {
        this.sio.on('connection', (socket) => {
            socket.emit('hello', 'Hello world');
        });
    }

    private emitTime() {
        this.sio.sockets.emit('clock', new Date().toLocaleTimeString());
    }
}
