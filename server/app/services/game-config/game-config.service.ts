import { Injectable } from '@nestjs/common';

@Injectable()
export class GameConfigService {
    private countdownTime = 30;
    private penaltyTime = 5;
    private timeGained = 5;

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
