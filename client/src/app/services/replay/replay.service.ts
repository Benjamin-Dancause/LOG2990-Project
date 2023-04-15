import { Injectable } from '@angular/core';
import { GameAction } from '@app/interfaces/game-action';

@Injectable({
    providedIn: 'root',
})
export class ReplayService {
    constructor() {}

    public gameActions: GameAction[] = [];

    addAction(time: number, action: string, payload?: any) {
        console.log(time);
        console.log(action);
        if (payload) {
            console.log(payload);
        }
    }
}
