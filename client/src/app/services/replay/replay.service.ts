import { Injectable } from '@angular/core';
import { GameAction } from '@app/interfaces/game-action';

@Injectable({
    providedIn: 'root',
})
export class ReplayService {
    constructor() {}

    public gameActions: GameAction[] = [];
    private time: number = 0;
    private actionTime: number = 0;

    addAction(time: number, action: string, payload?: any): void {
        console.log(time);
        console.log(action);
        if (payload) {
            console.log(payload);
        }
        const gameAction: GameAction = { time, action, payload };
        this.gameActions.push(gameAction);
    }

    startReplay(): void {
        this.setNextActionTime();

        if ((this.time = this.actionTime)) {
            this.playAction();
        }
    }

    getAction(): GameAction {
        return this.gameActions[0];
    }

    setNextActionTime(): void {
        this.actionTime = this.gameActions[0].time;
    }

    goToNextAction(): void {
        this.gameActions.shift();
        this.setNextActionTime();
    }

    playAction(): void {
        const gameAction = this.getAction();
        switch (gameAction.action) {
            case 'update-difference':
                //Call updateDifference
                console.log('update-difference: ' + gameAction.payload);
                break;
            default:
                break;
        }

        this.goToNextAction();
    }
}
