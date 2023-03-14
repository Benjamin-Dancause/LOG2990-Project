import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class WaitingRoomService {
    private readonly baseUrl: string = environment.webSocketUrl;
    public socket: Socket;
    constructor() {}
    initializeSocket(): void {
        // const uniqueId = Math.random().toString(36).substring(7);
        // this.counterSocket = io(this.baseUrl, { query: { id: uniqueId } });
        // console.log('This is the uniqueID for counter: ' + uniqueId);
        if (this.socket) {
            this.socket.connect();
            return;
        }
        this.socket = io(this.baseUrl);
        console.log('This is the uniqueID for socket: ' + this.socket.id);
        this.socket.on('counter-update', (counter: number) => {
            console.log('I entered the observable return');
        });
    }

    soloGame(): void {
        this.socket.emit('solo-game');
    }

    disconnectSocket() {
        this.socket.disconnect();
    }
}
