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
    private currentGameAction: GameAction;

    addAction(time: number, action: string, payload?: any): void {
        console.log(time);
        console.log(action);
        if (payload) {
            console.log(payload);
        }
        const gameAction: GameAction = { time, action, payload };
        //const gameAction: GameAction = { time: 0, action, payload };
        this.gameActions.push(gameAction);
    }

    startReplay(): void {
        this.setNextActionTime();

        if (this.time === this.actionTime) {
            this.playAction();
        }
    }

    getAction(): GameAction {
        return this.gameActions[0];
    }

    setNextActionTime(): void {
        if (this.gameActions.length > 0) {
            this.actionTime = this.gameActions[0].time;
        }
    }

    goToNextAction(): void {
        this.gameActions.shift();
        this.setNextActionTime();
        this.currentGameAction = this.getAction();
    }

    playAction(): void {
        this.currentGameAction = this.getAction();
        switch (this.currentGameAction.action) {
            case 'update-difference':
                //Call updateDifference
                console.log('update-difference for ' + this.currentGameAction.time + ' : ' + this.currentGameAction.payload);
                break;

            case 'difference-found':
                //call stuff for difference errors
                console.log('difference-found for ' + this.currentGameAction.time);
                this.goToNextAction();
                console.log('update-difference for ' + this.currentGameAction.time + ' : ' + this.currentGameAction.payload);
                break;

            case 'difference-error':
                console.log('difference-error for ' + this.currentGameAction.time);
                break;
            default:
                break;
        }

        this.goToNextAction();
    }
}
