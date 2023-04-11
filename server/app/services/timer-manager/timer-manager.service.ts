import { ClassicModeGateway } from '@app/gateways/timer/classic-mode.gateway';
import { DELAY } from '@common/constants';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TimerManagerService {
    private timers = new Map<string, number>();
    private intervals = new Map<string, NodeJS.Timeout>();

    constructor(@Inject(forwardRef(() => ClassicModeGateway)) private readonly classicModeGateway: ClassicModeGateway) {}

    startTimer(roomId: string, gameMode: string) {
        console.log(this.timers.has(roomId) + 'roomId: ' + roomId);
        if (!this.timers.has(roomId)) {
            console.log('start timer');
            const time: number = this.getTimeFromRoom(roomId, gameMode);
            this.timers.set(roomId, time);
            const intervalId = setInterval(() => {
                this.updateTimer(roomId, gameMode);
            }, DELAY.SMALLTIMEOUT);
            this.intervals.set(roomId, intervalId);
        }
    }

    updateTimer(roomId: string, gameMode: string) {
        if (gameMode === 'tl') {
            this.timers.set(roomId, this.timers.get(roomId) - 1);
        } else {
            this.timers.set(roomId, this.timers.get(roomId) + 1);
        }
        this.classicModeGateway.emitTimeToRoom(roomId, this.timers.get(roomId));
    }

    addToTimer(roomId: string, increment: number) {
        this.timers.set(roomId, this.timers.get(roomId) + increment);
        if (this.timers.get(roomId) >= 120) {
            this.timers.set(roomId, 120);
        }
        this.classicModeGateway.emitTimeToRoom(roomId, this.timers.get(roomId));
    }

    removeToTimer(roomId: string, decrement: number) {
        this.timers.set(roomId, this.timers.get(roomId) - decrement);
        if (this.timers.get(roomId) <= 0) {
            this.timers.set(roomId, 0);
        }
        this.classicModeGateway.emitTimeToRoom(roomId, this.timers.get(roomId));
    }

    getTimeFromRoom(roomId: string, gameMode: string): number {
        if (gameMode === 'tl') {
            return this.timers.get(roomId) || 60;
        }
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

    isInitializedTimer(roomId: string): boolean {
        return this.timers.has(roomId);
    }
}
