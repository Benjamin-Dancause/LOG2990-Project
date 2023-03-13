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
        console.log(roomId);
        this.counters.set(roomId, this.counters.get(roomId) + 1);
        const counter = this.counters.get(roomId);
        console.log('counter: ' + counter);
        return counter;
    }

    resetCounter(client: Socket) {
        this.counters.set(client.id, 0);
        const counter = this.counters.get(client.id);
    }
}
