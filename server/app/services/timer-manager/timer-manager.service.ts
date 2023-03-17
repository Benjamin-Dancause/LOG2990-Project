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
            console.log("LINE 20 ============== " + this.intervals.get(roomId));
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
        //console.log(this.intervals.get(roomId));
        clearInterval(this.intervals.get(roomId));
        this.intervals.delete(roomId);
        this.timers.delete(roomId);
    }

    resetTimer(roomId: string) {
        const time = 0;
        this.timers.set(roomId, time);
        this.deleteTimerData(roomId);
    }
}
