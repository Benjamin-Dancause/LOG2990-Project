import { TimerGateway } from '@app/gateways/timer/timer.gateway';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TimerManagerService {
    private timers = new Map<string, number>();
    private intervals = new Map<string, NodeJS.Timeout>();

    constructor(@Inject(forwardRef(() => TimerGateway)) private readonly timerGateway: TimerGateway) {}

    startTimer(roomId: string) {
        if(!this.timers.has(roomId)) {
            const time: number = this.getTimeFromRoom(roomId);
            console.log('Line 13 ' + roomId);
            this.timers.set(roomId, time);
            const intervalId = setInterval(() => {
                this.updateTimer(roomId);
            }, 1000);
            this.intervals.set(roomId, intervalId);
        }
    }

    updateTimer(roomId: string) {
        this.timers.set(roomId, this.timers.get(roomId) + 1);
        this.timerGateway.emitTimeToRoom(roomId, this.timers.get(roomId));
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
        console.log('reset id: ' + roomId);
        this.timers.set(roomId, time);
        this.deleteTimerData(roomId);
    }
}
