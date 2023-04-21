/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter, Injectable } from '@angular/core';
import { GameAction } from '@app/interfaces/game-action';
import { DELAY, TIME } from '@common/constants';
import { Coords } from '@common/game-interfaces';
import { CanvasReplayService } from '../canvas-replay/canvas-replay.service';
import { ChatService } from '../chat/chat.service';

@Injectable({
    providedIn: 'root',
})
export class ReplayService {
    gameActions: GameAction[] = [];
    replayIndex: number = 0;
    replaySpeed: number = 1;
    replayTimer: number = 0;
    replayInterval: any;
    differencesFound: number[] = [];
    cheatInterval: ReturnType<typeof setInterval>;
    checkActionInterval: any;
    usingCheatMode: boolean = false;
    endOfReplay: boolean = false;
    actionTime: number = 0;
    ownCounter: number = 0;
    opponentCounter: number = 0;
    speedSettings: number[] = [1, 2, TIME.FOUR_X_SPEED];
    private currentGameAction: GameAction;
    timerEvent = new EventEmitter<number>();
    counterEvent = new EventEmitter<number[]>();

    constructor(public chat: ChatService, public canvasReplay: CanvasReplayService) {}

    addAction(time: number, action: string, payload?: any): void {
        const gameAction: GameAction = { time, action, payload };
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
                this.ownCounter = this.currentGameAction.payload.counter1;
                this.opponentCounter = this.currentGameAction.payload.counter2;
                this.counterEvent.emit([this.ownCounter, this.opponentCounter]);
                const coords: Coords[] = this.currentGameAction.payload.response.coords;
                this.canvasReplay.updateDifferences(coords);
                break;

            case 'difference-found':
                this.canvasReplay.foundPopup(this.currentGameAction.payload.mousePosition, this.currentGameAction.payload.context);
                break;

            case 'difference-error':
                this.canvasReplay.errorPopup(this.currentGameAction.payload.mousePosition, this.currentGameAction.payload.context);
                break;

            case 'message':
                this.chat.messages.push(this.currentGameAction.payload);
                break;
            case 'cheat-mode-on':
                this.usingCheatMode = true;
                this.differencesFound = this.currentGameAction.payload;
                this.canvasReplay.flashAllDifferences(this.differencesFound);
                this.cheatInterval = setInterval(() => {
                    this.canvasReplay.flashAllDifferences(this.differencesFound);
                }, DELAY.SMALLTIMEOUT / this.replaySpeed);
                break;
            case 'cheat-mode-off':
                this.usingCheatMode = false;
                clearInterval(this.cheatInterval);
                break;
            case 'hint-one':
                this.replayTimer = this.currentGameAction.payload.newTime;
                this.canvasReplay.flashOneDifference1(this.currentGameAction.payload.randomDiff, this.currentGameAction.payload.differencesFound);
                break;
            case 'hint-two':
                this.replayTimer = this.currentGameAction.payload.newTime;
                this.canvasReplay.flashOneDifference2(this.currentGameAction.payload.randomIndex, this.currentGameAction.payload.differencesFound);
                break;
            case 'hint-three':
                this.replayTimer = this.currentGameAction.payload;
                break;
            default:
                break;
        }
        this.goToNextAction();
        if (this.gameActions.length - this.replayIndex > 0) {
            setTimeout(() => {
                this.checkForAction();
            }, 100 / this.replaySpeed);
        } else {
            this.endOfReplay = true;
            this.pauseReplayTimer();
        }
    }

    changeSpeed(index: number): void {
        this.replaySpeed = this.speedSettings[index];
        this.canvasReplay.updateReplaySpeed(this.replaySpeed);
        this.startReplayTimer();
    }

    startReplayTimer(): void {
        if (this.endOfReplay) {
            return;
        }
        this.counterEvent.emit([this.ownCounter, this.opponentCounter]);
        this.pauseReplayTimer();
        const interval = DELAY.SMALLTIMEOUT / this.replaySpeed;
        this.replayInterval = setInterval(() => {
            this.replayTimer++;
            this.timerEvent.emit(this.replayTimer);
            if (this.gameActions.length - this.replayIndex > 0) {
                this.checkForAction();
            }
        }, interval);
        if (this.usingCheatMode) {
            this.canvasReplay.flashAllDifferences(this.differencesFound);
            this.cheatInterval = setInterval(() => {
                this.canvasReplay.flashAllDifferences(this.differencesFound);
            }, DELAY.SMALLTIMEOUT / this.replaySpeed);
        }
    }

    pauseReplayTimer(): void {
        clearInterval(this.replayInterval);
        clearInterval(this.cheatInterval);
    }

    resetReplayTimer(): void {
        this.actionTime = 0;
        this.replayIndex = 0;
        this.pauseReplayTimer();
        this.differencesFound = [];
        this.replayTimer = 0;
        this.usingCheatMode = false;
        this.endOfReplay = false;
        this.ownCounter = 0;
        this.opponentCounter = 0;
        clearInterval(this.cheatInterval);
    }

    resetReplayData(): void {
        this.actionTime = 0;
        this.replayIndex = 0;
        this.pauseReplayTimer();
        this.differencesFound = [];
        this.replayTimer = 0;
        this.gameActions = [];
        this.replaySpeed = 1;
        this.usingCheatMode = false;
        this.ownCounter = 0;
        this.opponentCounter = 0;
        this.endOfReplay = false;
        clearInterval(this.cheatInterval);
    }
}
