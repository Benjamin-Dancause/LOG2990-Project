import { ClassicModeGateway } from '@app/gateways/classic-mode/classic-mode.gateway';
import { GameConfigService } from '@app/services/game-config/game-config.service';
import { DELAY, TIME } from '@common/constants';
import { GameConstants } from '@common/game-interfaces';
import { Inject, Injectable, forwardRef } from '@nestjs/common';

@Injectable()
export class TimerManagerService {
    timers = new Map<string, number>();
    intervals = new Map<string, NodeJS.Timeout>();
    constants = new Map<string, GameConstants>();

    constructor(
        @Inject(forwardRef(() => ClassicModeGateway)) public classicModeGateway: ClassicModeGateway,
        @Inject(GameConfigService) private readonly gameConfig: GameConfigService,
    ) {}

    startTimer(roomId: string, gameMode: string) {
        if (!this.timers.has(roomId)) {
            const penaltyTime = gameMode === 'tl' ? -this.gameConfig.getPenaltyTime() : this.gameConfig.getPenaltyTime();
            const constants: GameConstants = {
                startTime: this.gameConfig.getCountdownTime(),
                increment: this.gameConfig.getTimeGained(),
                penalty: penaltyTime,
            };
            this.constants.set(roomId, constants);
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

    addToTimer(roomId: string) {
        this.timers.set(roomId, this.timers.get(roomId) + this.constants.get(roomId).increment);
        if (this.timers.get(roomId) >= TIME.MAX_LIMITED_TIMER) {
            this.timers.set(roomId, TIME.MAX_LIMITED_TIMER);
        }
        this.classicModeGateway.emitTimeToRoom(roomId, this.timers.get(roomId));
    }

    removeToTimer(roomId: string) {
        this.timers.set(roomId, this.timers.get(roomId) + this.constants.get(roomId).penalty);
        if (this.timers.get(roomId) <= 0) {
            this.timers.set(roomId, 0);
        }
        this.classicModeGateway.emitTimeToRoom(roomId, this.timers.get(roomId));
    }

    getTimeFromRoom(roomId: string, gameMode: string): number {
        if (gameMode === 'tl') {
            return this.timers.get(roomId) || this.constants.get(roomId).startTime;
        }
        return this.timers.get(roomId) || 0;
    }

    deleteTimerData(roomId: string) {
        clearInterval(this.intervals.get(roomId));
        this.intervals.delete(roomId);
        this.timers.delete(roomId);
        this.constants.delete(roomId);
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
