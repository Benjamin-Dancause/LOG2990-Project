import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface GameRoom {
    roomId: string;
    gameName: string;
    players: Socket[];
}

@Injectable()
export class RoomService {
    private rooms: GameRoom[] = [];

    createRoom(): void {}

    joinRoom(): void {}

    private getRoomById(): GameRoom | undefined {
        return undefined;
    }
}
