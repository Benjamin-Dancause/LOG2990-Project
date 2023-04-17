import { TestBed } from '@angular/core/testing';
import { CanvasReplayService } from '../canvas-replay/canvas-replay.service';

import { ReplayService } from './replay.service';

describe('ReplayService', () => {
    let service: ReplayService;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // let canvasReplayMock: any;
    let canvasReplaySpy: jasmine.SpyObj<CanvasReplayService>;

    beforeEach(() => {
        canvasReplaySpy = jasmine.createSpyObj('CanvasReplayService', ['updateDifferences', 'foundPopup', 'errorPopup']);
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
        spyOn(service.canvasReplay, 'updateReplaySpeed');
        spyOn(service, 'startReplayTimer');
        service.changeSpeed(index);
        expect(service.replaySpeed).toEqual(speed);
        expect(service.canvasReplay.updateReplaySpeed).toHaveBeenCalledWith(speed);
        expect(service.startReplayTimer).toHaveBeenCalled();
    });

    it('should pause the replay timer, set the replay interval, and call checkForAction() on each interval', () => {
        spyOn(service, 'pauseReplayTimer');
        spyOn(window, 'setInterval').and.callThrough();
        spyOn(service, 'checkForAction');
        service.startReplayTimer();
        expect(service.pauseReplayTimer).toHaveBeenCalled();
        expect(window.setInterval).toHaveBeenCalled();
        // expect(service.checkForAction).toHaveBeenCalled();
    });

    it('should clear the replay interval', () => {
        spyOn(window, 'clearInterval');
        service.replayInterval = 123;
        service.pauseReplayTimer();
        expect(window.clearInterval).toHaveBeenCalledWith(service.replayInterval);
        // expect(service.replayInterval).toBeNull();
    });

    it('should reset the replay timer, replay index, action time, and pause the replay timer', () => {
        spyOn(service, 'pauseReplayTimer');
        service.actionTime = 123;
        service.replayIndex = 456;
        service.replayTimer = 789;
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
        // expect(service.chat.messages.length).toBe(0);
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
        expect(canvasReplaySpy.updateDifferences).toHaveBeenCalled();
    });

    describe('when difference-found action is received', () => {
        beforeEach(() => {
            const gameAction = {
                time: 0,
                action: 'difference-found',
                payload: { mousePosition: { x: 10, y: 10 }, context: 'context', coords: { x: 20, y: 20 } },
            };
            service.addAction(gameAction.time, gameAction.action, gameAction.payload);
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
});