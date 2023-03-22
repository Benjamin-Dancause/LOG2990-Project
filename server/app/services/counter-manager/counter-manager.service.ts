import { Injectable } from '@nestjs/common';

@Injectable()
export class CounterManagerService {
    private counters: Map<string, number> = new Map();

    startCounter(roomId: string) {
        const count: number = this.getCounterFromRoom(roomId);
        this.counters.set(roomId, count);
    }

    deleteCounterData(roomId: string) {
        this.counters.delete(roomId);
    }

    getCounterFromRoom(roomId: string): number {
        return this.counters.get(roomId) || 0;
    }

    incrementCounter(roomId: string): number {
        this.counters.set(roomId, this.counters.get(roomId) + 1);
        const counter = this.counters.get(roomId);
        return counter;
    }

    resetCounter(roomId: string): number {
        this.counters.set(roomId, 0);
        const counter = this.counters.get(roomId);
        return counter;
    }
}
