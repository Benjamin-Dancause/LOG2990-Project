/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-restricted-imports */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ClickResponse } from '@app/classes/click-response';
import { DELAY } from '@common/constants';
import { Coords, GameDiffData } from '@common/game-interfaces';
import { of, Subscription } from 'rxjs';
import { CommunicationService } from '../communication/communication.service';
import { CounterService } from '../counter/counter.service';
import { SocketService } from '../socket/socket.service';
import { TimerService } from '../timer/timer.service';
import { GameService } from './game.service';

fdescribe('GameService', () => {
    let gameService: GameService;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockCounterService: jasmine.SpyObj<CounterService>;
    let mockCommunicationService: jasmine.SpyObj<CommunicationService>;
    let mockTimerService: jasmine.SpyObj<TimerService>;

    beforeEach(() => {
        mockSocketService = jasmine.createSpyObj('SocketService', [
            'incrementCounter',
            'resetCounter',
            'sendVictoriousPlayer',
            'sendDifferenceFound',
            'addToTimer',
            'removeToTimer',
            'switchGame'
        ]);
        mockTimerService = jasmine.createSpyObj('TimerService', ['getTime']);
        mockSocketService.socket = jasmine.createSpyObj('Socket', ['on', 'off', 'emit']);
        mockCounterService = jasmine.createSpyObj('CounterService', ['incrementCounter', 'resetCounter', 'removeToTimer']);
        mockCommunicationService = jasmine.createSpyObj('CommunicationService', ['getDifferences', 'sendPosition', 'getAllDiffs', 'updateBestTimes']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                GameService,
                { provide: CommunicationService },
                { provide: SocketService, useValue: mockSocketService },
                { provide: CounterService, useValue: mockCounterService },
                { provide: CommunicationService, useValue: mockCommunicationService },
                { provide: TimerService, useValue: mockTimerService },
            ],
        });

        gameService = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(gameService).toBeTruthy();
    });

    it('should add the given context to playAreaCtx', () => {
        const mockCtx = {} as CanvasRenderingContext2D;
        gameService.getContexts(mockCtx);
        expect(gameService['playAreaCtx']).toContain(mockCtx);
    });

    it('should add the clicked difference to differenceFound', () => {
        const mockCoords = [{ x: 0, y: 0 }];
        spyOn(gameService, 'flashDifferences');
        spyOn(gameService, 'updateImages');
        gameService.updateDifferences({ coords: mockCoords, differenceNumber: 1, isDifference: true });
        expect(gameService['differenceFound']).toContain(1);
    });

    it('should call flashDifferences and updateImages with the correct parameters', () => {
        const mockCoords = [{ x: 0, y: 0 }];
        spyOn(gameService, 'flashDifferences');
        spyOn(gameService, 'updateImages');
        gameService.updateDifferences({ coords: mockCoords, differenceNumber: 1, isDifference: true });
        expect(gameService.flashDifferences).toHaveBeenCalledWith(mockCoords, gameService['playAreaCtx']);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(gameService.updateImages).toHaveBeenCalled;
    });

    it('should update the differences found array', () => {
        const mockResponse: ClickResponse = { coords: [{ x: 10, y: 10 }], differenceNumber: 1, isDifference: true };
        sessionStorage.setItem('gameMode', 'solo');
        spyOn(gameService, 'flashDifferences');
        gameService.updateDifferences(mockResponse);
        expect(gameService['differenceFound']).toContain(mockResponse.differenceNumber);
        sessionStorage.removeItem('gameMode');
    });

    it('should toggle isCheatEnabled', () => {
        const mockCtx = {} as CanvasRenderingContext2D[];
        spyOn(gameService, 'flashAllDifferences');
        gameService.cheatMode(mockCtx);
        expect(gameService['isCheatEnabled']).toBeTrue();
        gameService.cheatMode(mockCtx);
        expect(gameService['isCheatEnabled']).toBeFalse();
    });

    it('should call flashAllDifferences with the correct parameters', () => {
        const mockCtx = {} as CanvasRenderingContext2D[];
        spyOn(gameService, 'flashAllDifferences');
        gameService.flashAllDifferences(mockCtx);
        expect(gameService.flashAllDifferences).toHaveBeenCalledWith(mockCtx);
    });

    it('updateDifference should  call this.socketService.addToTimer', fakeAsync(() => {
        spyOn(gameService, 'updateImages');
        spyOn(gameService, 'flashDifferences');
        sessionStorage.setItem('gameMode', 'tl');
        gameService.updateDifferences({ coords: [{ x: 10, y: 10 }], differenceNumber: 1, isDifference: true });
        tick(DELAY.BIGTIMEOUT);
        expect(gameService.updateImages).not.toHaveBeenCalled();
        expect(mockSocketService.addToTimer).toHaveBeenCalled();
        sessionStorage.removeItem('gameMode');
    }));

    it('updateDifference should call updateImage', fakeAsync(() => {
        spyOn(gameService, 'updateImages');
        spyOn(gameService, 'flashDifferences');
        sessionStorage.setItem('gameMode', '1v1');
        gameService.updateDifferences({ coords: [{ x: 10, y: 10 }], differenceNumber: 1, isDifference: true });
        tick(DELAY.BIGTIMEOUT);
        expect(gameService.updateImages).toHaveBeenCalled();
        sessionStorage.removeItem('gameMode');
    }));

    it('cheatMode should flashAllDifference after some time', fakeAsync(() => {
        const mockCtx = {} as CanvasRenderingContext2D[];
        spyOn(gameService, 'flashAllDifferences');
        gameService.cheatMode(mockCtx);
        tick(DELAY.SMALLTIMEOUT);
        expect(gameService.flashAllDifferences).toHaveBeenCalledWith(mockCtx);
        gameService.cheatMode(mockCtx);
    }));

    it('blinkAllDifference should flash the difference after some time', fakeAsync(() => {
        const mockCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const mockCtxs = [mockCtx, mockCtx, mockCtx, mockCtx];
        const gameData = { differences: [[{ x: 10, y: 10 }]] } as GameDiffData;
        spyOn(gameService, 'flashDifferences');
        spyOn(mockCtx, 'fillRect').and.callThrough();
        gameService.blinkAllDifferences(mockCtxs, gameData);
        tick(DELAY.SMALLTIMEOUT);
        expect(mockCtx.fillRect).toHaveBeenCalledTimes(8);
    }));

    it('should flash the differences on canvas', fakeAsync(() => {
        const mockCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const mockCtxs = [mockCtx, mockCtx, mockCtx, mockCtx];
        const mockCoords = [{ x: 10, y: 10 }];
        const fillRectSpy = spyOn(mockCtx, 'fillRect').and.callThrough();
        const clearRectSpy = spyOn(mockCtx, 'clearRect').and.callThrough();
        gameService.flashDifferences(mockCoords, mockCtxs);
        tick(DELAY.SMALLTIMEOUT);
        expect(fillRectSpy).toHaveBeenCalledTimes(8);
        expect(clearRectSpy).toHaveBeenCalledTimes(8);
    }));

    it("incrementCounter should increment the counter's incrementCounter function", () => {
        gameService.incrementCounter();
        expect(mockCounterService.incrementCounter).toHaveBeenCalled();
    });

    it('playErrorSound should play the error sound', () => {
        spyOn(gameService['errorSound'], 'play');
        gameService.playErrorSound();
        expect(gameService['errorSound'].play).toHaveBeenCalled();
    });

    it('playSuccessSound should play the success sound', () => {
        spyOn(gameService['successSound'], 'play');
        gameService.playSuccessSound();
        expect(gameService['successSound'].play).toHaveBeenCalled();
    });

    it('should update the game name', () => {
        sessionStorage.removeItem('gameTitle');
        gameService.setGameName();
        expect(gameService['gameName']).toEqual('');
        sessionStorage.setItem('gameTitle', 'test game');
        gameService.setGameName();
        expect(gameService['gameName']).toEqual('test game');
    });

    it('should update images on canvas', () => {
        const mockCoords: Coords[] = [{ x: 10, y: 10 }];
        const mockImageData = new ImageData(1, 1);
        const mockCtx1 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const mockCtx2 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const getImageDataSpy = spyOn(mockCtx1, 'getImageData').and.returnValue(mockImageData);
        gameService.updateImages(mockCoords, mockCtx1, mockCtx2);
        expect(getImageDataSpy).toHaveBeenCalledTimes(1);
    });

    it('should clear difference array', () => {
        gameService['differenceFound'] = [1, 2, 3];
        gameService.clearDifferenceArray();
        expect(gameService['differenceFound']).toEqual([]);
    });

    it('should empty the context array', () => {
        gameService['playAreaCtx'] = [{} as CanvasRenderingContext2D, {} as CanvasRenderingContext2D];
        gameService.clearContexts();
        expect(gameService['playAreaCtx']).toEqual([]);
    });

    it('should do nothing if click disabled', () => {
        gameService['isClickDisabled'] = true;
        spyOn(gameService, 'updateDifferences');
        const mockEvent = { offsetX: 0, offsetY: 0 } as MouseEvent;
        gameService.checkClick(mockEvent);
        expect(gameService.updateDifferences).not.toHaveBeenCalled();
    });

    // it('checkClick should call playSuccessSound when the clicked on a difference', fakeAsync(() => {
    //     const mockCanvas = document.createElement('canvas') as HTMLCanvasElement;
    //     const mockCtx = mockCanvas.getContext('2d') as CanvasRenderingContext2D;
    //     const mockCtxs = [mockCtx, mockCtx, mockCtx, mockCtx];
    //     gameService['isClickDisabled'] = false;
    //     spyOn(gameService, 'playSuccessSound');
    //     spyOn(gameService, 'updateDifferences');
    //     const response = { coords: [{ x: 0, y: 0 }], differenceNumber: 1, isDifference: true } as ClickResponse;
    //     mockCommunicationService.sendPosition.and.returnValue(of(response));
    //     const mockEvent = { offsetX: 0, offsetY: 0, button: MouseButton.Left, target: mockCanvas } as unknown as MouseEvent;
    //     gameService.checkClick(mockEvent, mockCounterService, mockCtxs);
    //     tick(DELAY.SMALLTIMEOUT);
    //     expect(gameService.playSuccessSound).toHaveBeenCalled();
    // }));

    // it('checkClick should call playErrorSound when the clicked on a difference', fakeAsync(() => {
    //     const mockCanvas = document.createElement('canvas') as HTMLCanvasElement;
    //     const mockCtx = mockCanvas.getContext('2d') as CanvasRenderingContext2D;
    //     const mockCtxs = [mockCtx, mockCtx, mockCtx, mockCtx];
    //     // gameService['playAreaCtx'] = mockCtxs;
    //     gameService['isClickDisabled'] = false;
    //     spyOn(gameService, 'playErrorSound');
    //     spyOn(gameService, 'updateDifferences');
    //     const response = { coords: [{ x: 0, y: 0 }], differenceNumber: 1, isDifference: false } as ClickResponse;
    //     mockCommunicationService.sendPosition.and.returnValue(of(response));
    //     const mockEvent = { offsetX: 0, offsetY: 0, button: MouseButton.Left, target: mockCanvas } as unknown as MouseEvent;
    //     gameService.checkClick(mockEvent, mockCounterService, mockCtxs);
    //     tick(DELAY.SMALLTIMEOUT);
    //     expect(gameService.playErrorSound).toHaveBeenCalled();
    // }));

    it('flashAllDifferences should call blinkAllDifferences', () => {
        const mockCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const mockCtxs = [mockCtx, mockCtx, mockCtx, mockCtx];
        const coord = { x: 0, y: 0 } as Coords;
        const gameData = { differences: [[coord]] } as GameDiffData;
        mockCommunicationService.getAllDiffs.and.returnValue(of(gameData));
        spyOn(gameService, 'blinkAllDifferences');
        gameService.flashAllDifferences(mockCtxs);
        expect(gameService.blinkAllDifferences).toHaveBeenCalled();
    });
    // it('should toggle isHintModeEnabled and call flashOneDifference1 and setTimeout if isHintModeEnabled is true', fakeAsync(() => {
    //     const mockCtx = {} as CanvasRenderingContext2D;

    //     const flashOneDifference1Spy = spyOn(gameService, 'flashOneDifference1');
    //     const hintMessageEmitSpy = spyOn(gameService.hintMessage, 'emit');
    //     gameService.isHintModeEnabled = false;
    //     const timeout = 1000;

    //     gameService.hintMode1([mockCtx]);
    //     expect(hintMessageEmitSpy).toHaveBeenCalled();
    //     expect(gameService.isHintModeEnabled).toBeTrue();
    //     expect(flashOneDifference1Spy).toHaveBeenCalled();

    //     tick(timeout);
    //     expect(gameService.isHintModeEnabled).toBeFalse();
    //     expect(clearInterval).toHaveBeenCalled();
    // }));

    // it('should toggle isHintModeEnabled and call flashOneDifference1 and setTimeout if isHintModeEnabled is true', fakeAsync(() => {
    //     const mockCtx = {} as CanvasRenderingContext2D;
    //     const flashOneDifference2Spy = spyOn(gameService, 'flashOneDifference2');
    //     const hintMessageEmitSpy = spyOn(gameService.hintMessage, 'emit');
    //     gameService.isHintModeEnabled = false;
    //     const timeout = 1000;

    //     gameService.hintMode2([mockCtx]);
    //     expect(hintMessageEmitSpy).toHaveBeenCalled();
    //     expect(gameService.isHintModeEnabled).toBeTrue();
    //     expect(flashOneDifference2Spy).toHaveBeenCalled();

    //     tick(timeout);
    //     expect(gameService.isHintModeEnabled).toBeFalse();
    //     expect(clearInterval).toHaveBeenCalled();
    // }));

    it('should disable hint mode and clear the timeout when called and hint mode was previously enabled', fakeAsync(() => {
        const mockCtx = {} as CanvasRenderingContext2D;
        gameService.getContexts(mockCtx);
        gameService.isHintModeEnabled = true;
        gameService.cheatTimeout = 1 as unknown;
        spyOn(window, 'clearInterval');
        gameService.hintMode2(gameService['playAreaCtx']);
        expect(gameService.isHintModeEnabled).toBeFalse();
        expect(clearInterval).toHaveBeenCalled();
        expect(gameService.cheatTimeout).toEqual(1);
    }));

    // it('should toggle isHintModeEnabled and call flashOneDifference1 and setTimeout if isHintModeEnabled is true', fakeAsync(() => {
    //     const mockCtx = {} as CanvasRenderingContext2D;
    //     const flashOneDifference3Spy = spyOn(gameService, 'flashOneRandomDifference');
    //     const hintMessageEmitSpy = spyOn(gameService.hintMessage, 'emit');
    //     gameService.isHintModeEnabled = true;
    //     const timeout = 1000;

    //     gameService.hintMode3([mockCtx]);
    //     expect(hintMessageEmitSpy).toHaveBeenCalled();
    //     expect(gameService.isHintModeEnabled).toBeTrue();
    //     expect(flashOneDifference3Spy).toHaveBeenCalled();

    //     tick(timeout);
    //     expect(gameService.isHintModeEnabled).toBeFalse();
    //     expect(clearInterval).toHaveBeenCalled();
    // }));

    it('resetGameValues should set otherGaveUp to false', () => {
        gameService['otherGaveUp'] = true;
        gameService.resetGameValues();
        expect(gameService['otherGaveUp']).toBeFalse();
    });

    it('clearTime should set time to 0 and unsubscribe', () => {
        gameService['time'] = 1;
        gameService['timeSubscription'] = new Subscription();
        spyOn(gameService['timeSubscription'], 'unsubscribe');
        gameService.clearTime();
        expect(gameService['time']).toEqual(0);
        expect(gameService['timeSubscription'].unsubscribe).toHaveBeenCalled();
    });

    it('timeUpdater should subscribe and set time', () => {
        gameService['time'] = 0;
        mockTimerService['getTime'].and.returnValue(of(1));
        gameService.timeUpdater();
        expect(gameService['time']).toEqual(1);
    });

    it('setGameName should set player1 to true when gameMode is tl', () => {
        sessionStorage.setItem('gameMode', 'tl');
        gameService.setGameName();
        expect(gameService['player1']).toBeTrue();
        sessionStorage.removeItem('gameMode');
    });

    
});
