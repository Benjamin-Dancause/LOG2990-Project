import { TestBed } from '@angular/core/testing';

import { ReplayService } from './replay.service';

describe('ReplayService', () => {
    let service: ReplayService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ReplayService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('addAction()', () => {
        it('should add a game action to the gameActions array', () => {
            const gameAction = { time: 0, action: 'test', payload: null };
            const initialLength = service.gameActions.length;
            service.addAction(gameAction.time, gameAction.action, gameAction.payload);
            expect(service.gameActions.length).toEqual(initialLength + 1);
            expect(service.gameActions[initialLength]).toEqual(gameAction);
        });
    });

    describe('checkForAction()', () => {
        it('should call playAction() when replayTimer is greater than or equal to actionTime', () => {
            spyOn(service, 'playAction');
            service.replayTimer = 10;
            service.actionTime = 5;
            service.checkForAction();
            expect(service.playAction).toHaveBeenCalled();
        });

        it('should not call playAction() when replayTimer is less than actionTime', () => {
            spyOn(service, 'playAction');
            service.replayTimer = 5;
            service.actionTime = 10;
            service.checkForAction();
            expect(service.playAction).not.toHaveBeenCalled();
        });
    });

    it('should return the current game action', () => {
        const gameAction = { time: 0, action: 'test', payload: null };
        service.gameActions = [gameAction];
        service.replayIndex = 0;
        expect(service.getAction()).toEqual(gameAction);
    });

    it('should set actionTime to the time of the next game action', () => {
        const gameAction = { time: 5, action: 'test', payload: null };
        service.gameActions = [gameAction, gameAction];
        service.replayIndex = 0;
        service.setNextActionTime();
        expect(service.actionTime).toEqual(gameAction.time);
    });

    it('should set actionTime to 0 if there are no more game actions', () => {
        service.gameActions = [];
        service.setNextActionTime();
        expect(service.actionTime).toEqual(0);
    });

    it('should clear the gameActions array and reset replayIndex, replayTimer, and actionTime to 0', () => {
        service.gameActions = [{ time: 0, action: 'test', payload: null }];
        service.replayIndex = 1;
        service.replayTimer = 10;
        service.actionTime = 5;
        service.deleteReplayInfo();
        expect(service.gameActions.length).toEqual(0);
        expect(service.replayIndex).toEqual(0);
        expect(service.replayTimer).toEqual(0);
        expect(service.actionTime).toEqual(0);
    });

    it('should increment replayIndex and set the next action time', () => {
        spyOn(service, 'setNextActionTime');
        service.replayIndex = 0;
        service.goToNextAction();
        expect(service.replayIndex).toEqual(1);
        expect(service.setNextActionTime).toHaveBeenCalled();
    });
});
