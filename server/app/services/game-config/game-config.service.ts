import { TIME } from '@common/constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameConfigService {
    private countdownTime = TIME.COUNTDOWN_TIME;
    private penaltyTime = TIME.SMALL_PENALTY;
    private timeGained = TIME.SMALL_TIME_GAINED;

    getCountdownTime(): number {
        return this.countdownTime;
    }

    setCountdownTime(countdownTime: number): void {
        this.countdownTime = countdownTime;
    }

    getPenaltyTime(): number {
        return this.penaltyTime;
    }

    setPenaltyTime(penaltyTime: number): void {
        this.penaltyTime = penaltyTime;
    }

    getTimeGained(): number {
        return this.timeGained;
    }

    setTimeGained(timeGained: number): void {
        this.timeGained = timeGained;
    }
}
