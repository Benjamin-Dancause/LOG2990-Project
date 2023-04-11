import { Injectable } from '@nestjs/common';

@Injectable()
export class GameConfigService {
    private countdownTime = 30;
    private penaltyTime = 5;
    private timeGained = 5;

    async getCountdownTime(): Promise<number> {
        return this.countdownTime;
    }

    setCountdownTime(countdownTime: number): void {
        this.countdownTime = countdownTime;
    }

    async getPenaltyTime(): Promise<number> {
        return this.penaltyTime;
    }

    setPenaltyTime(penaltyTime: number): void {
        this.penaltyTime = penaltyTime;
    }

    async getTimeGained(): Promise<number> {
        return this.timeGained;
    }

    setTimeGained(timeGained: number): void {
        this.timeGained = timeGained;
    }
}
