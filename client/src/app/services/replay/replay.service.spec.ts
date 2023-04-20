import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ClickResponse } from '@app/classes/click-response';
import { CanvasReplayService } from '../canvas-replay/canvas-replay.service';

import { ReplayService } from './replay.service';

describe('ReplayService', () => {
    let service: ReplayService;
    let canvasReplaySpy: jasmine.SpyObj<CanvasReplayService>;

    beforeEach(() => {
        canvasReplaySpy = jasmine.createSpyObj('CanvasReplayService', [
            'updateDifferences',
            'foundPopup',
            'errorPopup',
            'flashOneDifference1',
            'flashOneDifference2',
            'flashAllDifferences',
            'updateReplaySpeed',
        ]);
        TestBed.configureTestingModule({
            providers: [ReplayService, { provide: CanvasReplayService, useValue: canvasReplaySpy }],
        });
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

    it('should not call pauseTimer if endOfReplay is true and StartTimer is called', () => {
        service.endOfReplay = true;
        spyOn(service, 'pauseReplayTimer');
        service.startReplayTimer();
        expect(service.pauseReplayTimer).toHaveBeenCalledTimes(0);
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

    it('should update the replay speed, update the replay canvas speed, and start the replay timer', () => {
        const index = 1;
        const speed = service.speedSettings[index];
        spyOn(service, 'startReplayTimer');
        service.changeSpeed(index);
        expect(service.replaySpeed).toEqual(speed);
        expect(service.canvasReplay.updateReplaySpeed).toHaveBeenCalledWith(speed);
        expect(service.startReplayTimer).toHaveBeenCalled();
    });

    it('should pause the replay timer, set the replay interval, and call checkForAction() on each interval', () => {
        spyOn(service, 'pauseReplayTimer');
        spyOn(window, 'setInterval').and.callFake;
        spyOn(service, 'checkForAction');
        service.startReplayTimer();
        expect(service.pauseReplayTimer).toHaveBeenCalled();
        expect(window.setInterval).toHaveBeenCalled();
    });

    it('should call checkForAction after 100 ms if gameActions length > replayIndex', fakeAsync(() => {
        service.replaySpeed = 1;
        service.gameActions = [
            { time: 0, action: 'test' },
            { time: 0, action: 'test' },
            { time: 0, action: 'test' },
            { time: 0, action: 'test' },
        ];
        service.replayIndex = 0;
        spyOn(service, 'pauseReplayTimer');
        spyOn(window, 'setInterval').and.callFake;
        spyOn(service, 'checkForAction');
        service.playAction();
        tick(100);
        expect(service.checkForAction).toHaveBeenCalled();
    }));

    it('should increment replayTimer and call checkForAction on startReplayTimer', fakeAsync(() => {
        service.replaySpeed = 1;
        service.gameActions = [
            { time: 0, action: 'test' },
            { time: 0, action: 'test' },
            { time: 0, action: 'test' },
            { time: 0, action: 'test' },
        ];
        service.replayIndex = 0;
        service.replayTimer = 0;
        spyOn(service, 'pauseReplayTimer');
        spyOn(window, 'setInterval').and.callThrough();
        spyOn(service, 'checkForAction');
        service.startReplayTimer();
        tick(1000);
        expect(service.replayTimer).toEqual(1);
        clearInterval(service.replayInterval);
        expect(service.checkForAction).toHaveBeenCalled();
    }));

    it('should increment replayTimer and call checkForAction on startReplayTimer', fakeAsync(() => {
        service.replaySpeed = 1;
        service.replayIndex = 0;
        service.replayTimer = 0;
        service.usingCheatMode = true;
        spyOn(window, 'setInterval').and.callThrough();
        spyOn(service, 'checkForAction');
        service.startReplayTimer();
        tick(1000);
        expect(service.replayTimer).toEqual(1);
        clearInterval(service.replayInterval);
        clearInterval(service.cheatInterval);
        expect(canvasReplaySpy.flashAllDifferences).toHaveBeenCalled();
    }));

    it('should clear the replay interval', () => {
        spyOn(window, 'clearInterval');
        service.replayInterval = 123;
        service.pauseReplayTimer();
        expect(window.clearInterval).toHaveBeenCalledWith(service.replayInterval);
    });

    it('should reset the replay timer, replay index, action time, and pause the replay timer', () => {
        spyOn(service, 'pauseReplayTimer');
        service.gameActions = [
            { time: 0, action: 'test' },
            { time: 0, action: 'test' },
            { time: 0, action: 'test' },
            { time: 0, action: 'test' },
        ];
        service.replaySpeed = 2;
        service.actionTime = 123;
        service.replayIndex = 456;
        service.replayTimer = 789;
        service.resetReplayData();
        expect(service.gameActions).toEqual([]);
        expect(service.replaySpeed).toEqual(1);
        expect(service.actionTime).toEqual(0);
        expect(service.replayIndex).toEqual(0);
        expect(service.replayTimer).toEqual(0);
        expect(service.pauseReplayTimer).toHaveBeenCalled();
    });

    it('should reset all replayData and pause timer on resetReplayData', () => {
        spyOn(service, 'pauseReplayTimer').and.callFake;
        service.actionTime = 123;
        service.replayIndex = 456;
        service.replayTimer = 789;
        service.differencesFound = [1, 2, 3];
        service.resetReplayTimer();
        expect(service.actionTime).toEqual(0);
        expect(service.replayIndex).toEqual(0);
        expect(service.replayTimer).toEqual(0);
        expect(service.pauseReplayTimer).toHaveBeenCalled();
    });

    it('should call pauseReplayTimer when there are no more game actions', () => {
        spyOn(service, 'getAction').and.returnValue({
            action: 'update-difference',
            payload: {},
            time: 0,
        });
        spyOn(service, 'pauseReplayTimer');
        service.gameActions = [];
        service.replayIndex = 0;
        service.playAction();
        expect(service.pauseReplayTimer).toHaveBeenCalled();
    });

    it('should not do anything when action is unknown', () => {
        spyOn(service, 'getAction').and.returnValue({
            action: 'unknown',
            payload: {},
            time: 0,
        });
        service.playAction();
        expect(canvasReplaySpy.updateDifferences).not.toHaveBeenCalled();
        expect(canvasReplaySpy.foundPopup).not.toHaveBeenCalled();
        expect(canvasReplaySpy.errorPopup).not.toHaveBeenCalled();
    });

    it('should push a message to chat messages when action is message', () => {
        spyOn(service, 'getAction').and.returnValue({
            action: 'message',
            payload: {},
            time: 0,
        });
        service.playAction();
        expect(service.chat.messages.length).not.toBe(0);
    });

    it('should call errorPopup on canvasReplay when action is difference-error', () => {
        const payload = { mousePosition: [5, 6], context: {} };
        spyOn(service, 'getAction').and.returnValue({
            action: 'difference-error',
            payload,
            time: 0,
        });
        service.playAction();
        expect(canvasReplaySpy.updateDifferences).not.toHaveBeenCalled();
        expect(canvasReplaySpy.errorPopup).toHaveBeenCalled();
    });

    it('should add the game action to the gameActions array when action is not difference-found', () => {
        const gameAction = { time: 0, action: 'test', payload: null };
        const initialLength = service.gameActions.length;
        service.addAction(gameAction.time, gameAction.action, gameAction.payload);
        expect(service.gameActions.length).toEqual(initialLength + 1);
        expect(service.gameActions[initialLength]).toEqual(gameAction);
    });

    it('should should break when action is blink all difference', () => {
        spyOn(service, 'getAction').and.returnValue({
            action: 'blink-all-differences',
            payload: {},
            time: 0,
        });
        service.playAction();
        expect(canvasReplaySpy.updateDifferences).not.toHaveBeenCalled();
    });

    it('should difference-found exist', () => {
        spyOn(service, 'getAction').and.returnValue({
            action: 'difference-found',
            payload: {},
            time: 0,
        });
        service.playAction();
        expect(canvasReplaySpy.foundPopup).toHaveBeenCalled();
    });

    describe('when difference-found action is received', () => {
        beforeEach(() => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            const response: ClickResponse = {
                isDifference: true,
                differenceNumber: 2,
                coords: [{ x: 20, y: 20 }],
            };

            const gameAction1 = {
                time: 0,
                action: 'difference-found',
                payload: { mousePosition: { x: 10, y: 10 }, context: context },
            };

            const gameAction2 = {
                time: 0,
                action: 'update-difference',
                payload: response,
            };

            service.gameActions = [gameAction1, gameAction2];
            service.playAction();
        });

        it('should call goToNextAction', () => {
            expect(service.replayIndex).toEqual(1);
        });
    });

    it('should change the replay speed, update the replay canvas speed, and start the replay timer', () => {
        const index = 1;
        const speed = service.speedSettings[index];
        spyOn(service, 'startReplayTimer');

        service.changeSpeed(index);

        expect(service.replaySpeed).toEqual(speed);
        expect(service.canvasReplay.updateReplaySpeed).toHaveBeenCalledWith(speed);
        expect(service.startReplayTimer).toHaveBeenCalled();
    });

    it('should call clearInterval when action is cheat-mode-off', () => {
        spyOn(service, 'getAction').and.returnValue({
            action: 'cheat-mode-off',
            payload: {},
            time: 0,
        });
        service.playAction();
        expect(canvasReplaySpy.updateDifferences).not.toHaveBeenCalled();
    });

    it('should call flashOneDifference1 when action is hint-one', () => {
        spyOn(service, 'getAction').and.returnValue({
            action: 'hint-one',
            payload: {},
            time: 0,
        });
        service.playAction();
        expect(canvasReplaySpy.flashOneDifference1).toHaveBeenCalled();
    });

    it('should call flashOneDifference2 when action is hint-two', () => {
        spyOn(service, 'getAction').and.returnValue({
            action: 'hint-two',
            payload: {},
            time: 0,
        });
        service.playAction();
        expect(canvasReplaySpy.flashOneDifference2).toHaveBeenCalled();
    });
    it('should call flashAllDifferences when action is cheat-mode-on', fakeAsync(() => {
        service.replaySpeed = 1;
        spyOn(service, 'getAction').and.returnValue({
            action: 'cheat-mode-on',
            payload: {},
            time: 0,
        });
        spyOn(window, 'setInterval').and.callThrough();
        service.playAction();
        tick(3000);
        expect(canvasReplaySpy.flashAllDifferences).toHaveBeenCalledTimes(1);
        clearInterval(service.cheatInterval);
    }));

    it('should call not call flashOneDifference2 when action is hint-three', () => {
        spyOn(service, 'getAction').and.returnValue({
            action: 'hint-three',
            payload: {},
            time: 0,
        });
        service.playAction();
        expect(canvasReplaySpy.flashOneDifference2).not.toHaveBeenCalled();
    });

    it('should call flashOneDifference2 when action is hint-two', () => {
        spyOn(service, 'getAction').and.returnValue({
            action: 'hint-two',
            payload: {},
            time: 0,
        });
        service.playAction();
        expect(canvasReplaySpy.flashOneDifference2).toHaveBeenCalled();
    });
});
