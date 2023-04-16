import { Injectable } from '@angular/core';
import { GameAction } from '@app/interfaces/game-action';
import { CanvasReplayService } from '../canvas-replay/canvas-replay.service';
import { ChatService } from '../chat/chat.service';

@Injectable({
    providedIn: 'root',
})
export class ReplayService {
    constructor(private chat: ChatService, private canvasReplay: CanvasReplayService) {}

    public gameActions: GameAction[] = [];
    private actionTime: number = 0;
    private currentGameAction: GameAction;
    private speedSettings: number[] = [1, 2, 4];
    public replayIndex: number = 0;
    public replaySpeed: number = 1;
    public replayTimer: number = 0;
    replayInterval: any;
    checkActionInterval: any;

    addAction(time: number, action: string, payload?: any): void {
        const gameAction: GameAction = { time, action, payload };
        //const gameAction: GameAction = { time: 0, action, payload };
        this.gameActions.push(gameAction);
    }

    checkForAction(): void {
        if (this.replayTimer >= this.actionTime) {
            this.playAction();
        }
    }

    getAction(): GameAction {
        return this.gameActions[this.replayIndex];
    }

    setNextActionTime(): void {
        if (this.gameActions.length - this.replayIndex > 0) {
            this.actionTime = this.gameActions[this.replayIndex].time;
        }
    }

    goToNextAction(): void {
        this.replayIndex++;
        this.setNextActionTime();
        this.currentGameAction = this.getAction();
    }

    deleteReplayInfo(): void {
        this.gameActions = [];
        this.actionTime = 0;
        this.replayIndex = 0;
        this.replayTimer = 0;
    }

    playAction(): void {
        this.currentGameAction = this.getAction();
        switch (this.currentGameAction.action) {
            case 'update-difference':
                //Call updateDifference
                this.canvasReplay.updateDifferences(this.currentGameAction.payload.coords);
                break;

            case 'difference-found':
                //call stuff for difference errors
                this.canvasReplay.foundPopup(this.currentGameAction.payload.mousePosition, this.currentGameAction.payload.context);
                this.goToNextAction();
                this.canvasReplay.updateDifferences(this.currentGameAction.payload.coords);
                break;

            case 'difference-error':
                this.canvasReplay.errorPopup(this.currentGameAction.payload.mousePosition, this.currentGameAction.payload.context);
                break;

            case 'message':
                this.chat.messages.push(this.currentGameAction.payload);
                break;
            case 'blink-all-differences':
                console.log('blink-all-differences: ' + this.currentGameAction.payload.length);
                break;
            default:
                break;
        }
        this.goToNextAction();
        if (this.gameActions.length - this.replayIndex > 0) {
            this.checkForAction();
        } else {
            this.pauseReplayTimer();
        }
    }

    changeSpeed(index: number): void {
        this.replaySpeed = this.speedSettings[index];
        this.canvasReplay.updateReplaySpeed(this.replaySpeed);
        this.startReplayTimer();
    }

    startReplayTimer(): void {
        this.pauseReplayTimer();
        const interval = 1000 / this.replaySpeed;
        this.replayInterval = setInterval(() => {
            this.replayTimer++;
            if (this.gameActions.length - this.replayIndex > 0) {
                this.checkForAction();
            }

            console.log(this.replayTimer);
        }, interval);
    }

    pauseReplayTimer(): void {
        clearInterval(this.replayInterval);
    }

    resetReplayTimer(): void {
        this.actionTime = 0;
        this.replayIndex = 0;
        this.pauseReplayTimer();
        this.replayTimer = 0;
    }

    resetReplayData(): void {
        this.actionTime = 0;
        this.replayIndex = 0;
        this.pauseReplayTimer();
        this.replayTimer = 0;
        this.gameActions = [];
        this.replaySpeed = 1;
    }
}
