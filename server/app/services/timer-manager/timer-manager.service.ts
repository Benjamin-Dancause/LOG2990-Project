import { ClassicModeGateway } from '@app/gateways/timer/classic-mode.gateway';
import { DELAY } from '@common/constants';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TimerManagerService {
    private timers = new Map<string, number>();
    private intervals = new Map<string, NodeJS.Timeout>();

    constructor(@Inject(forwardRef(() => ClassicModeGateway)) private readonly classicModeGateway: ClassicModeGateway) {}

    startTimer(roomId: string) {
        if (!this.timers.has(roomId)) {
            const time: number = this.getTimeFromRoom(roomId);
            this.timers.set(roomId, time);
            const intervalId = setInterval(() => {
                this.updateTimer(roomId);
            }, DELAY.SMALLTIMEOUT);
            this.intervals.set(roomId, intervalId);
        }
    }

    updateTimer(roomId: string) {
        this.timers.set(roomId, this.timers.get(roomId) + 1);
        this.classicModeGateway.emitTimeToRoom(roomId, this.timers.get(roomId));
    }

    getTimeFromRoom(roomId: string): number {
        return this.timers.get(roomId) || 0;
    }

    deleteTimerData(roomId: string) {
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
