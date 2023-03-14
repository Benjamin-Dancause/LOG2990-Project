import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class CounterManagerService {
    private counters: Map<string, number> = new Map();

    startCounter(roomId: string) {
        const count: number = this.getCounterFromRoom(roomId);
        console.log('counter: ' + count);
        this.counters.set(roomId, count);
    }

    deleteCounterData(roomId: string) {
        this.counters.delete(roomId);
    }

    getCounterFromRoom(roomId: string): number {
        return this.counters.get(roomId) || 0;
    }

    incrementCounter(roomId: string): number {
        console.log('roomID received in manager:' + roomId);
        console.log('Current value in the map for the counter: ' + this.counters.get(roomId));
        this.counters.set(roomId, this.counters.get(roomId) + 1);
        const counter = this.counters.get(roomId);
        console.log('New value in the map for the counter: ' + counter);
        return counter;
    }

    resetCounter(client: Socket) {
        this.counters.set(client.id, 0);
        const counter = this.counters.get(client.id);
    }
}
