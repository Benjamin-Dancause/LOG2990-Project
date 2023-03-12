import { Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
export class TimerManagerService {

    private timers = new Map<string, number>();
    private intervals = new Map<string, NodeJS.Timeout>();
    @WebSocketServer() server: Server;

    startTimer(roomId: string) {
        const time: number = this.getTimeFromRoom(roomId);
        this.timers.set(roomId, time);
        const intervalId = setInterval( () => {
            this.updateTimer(roomId);
        }, 1000);
        this.intervals.set(roomId, intervalId);
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

    deleteTimerData(roomId: string) {
        this.timers.delete(roomId);
        clearInterval(this.intervals.get(roomId));
        this.intervals.delete(roomId);
    }

    resetTimer(roomId: string) {
        const time = 0;
        this.timers.set(roomId, time);
    }
}
