import { Injectable } from '@nestjs/common';
import * as http from 'http';
import * as io from 'socket.io';


@Injectable()
export class SocketManagerService {
    private sio: io.Server;
    private room: string = "serverRoom";
    constructor(server: http.Server) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ["GET", "POST"] } });
    }

    public handleSockets(): void {
        this.sio.on('connection', (socket) => {
            console.log(`user with id ${socket.id} connected`);
            socket.emit('hello', 'Hello world!');

            socket.on('disconnect', () => {
                console.log(`user with id ${socket.id} disconnected`);
            });

        });

        /*setInterval(() => {
            this.emitTime();
        }, 1000);*/
    }

    private emitTime() {
        this.sio.sockets.emit('clock', new Date().toLocaleTimeString());
    }

}
