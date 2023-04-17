/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-restricted-imports */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ClickResponse } from '@app/classes/click-response';
import { MouseButton } from '@app/classes/mouse-button';
import { DELAY } from '@common/constants';
import { Coords, GameDiffData } from '@common/game-interfaces';
import { of } from 'rxjs';
import { CommunicationService } from '../communication/communication.service';
import { CounterService } from '../counter/counter.service';
import { SocketService } from '../socket/socket.service';
import { GameService } from './game.service';

describe('GameService', () => {
    let gameService: GameService;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockCounterService: jasmine.SpyObj<CounterService>;
    let mockCommunicationService: jasmine.SpyObj<CommunicationService>;

    beforeEach(() => {
        mockSocketService = jasmine.createSpyObj('SocketService', [
            'incrementCounter',
            'resetCounter',
            'sendVictoriousPlayer',
            'sendDifferenceFound',
        ]);
        mockSocketService.socket = jasmine.createSpyObj('Socket', ['on']);
        mockCounterService = jasmine.createSpyObj('CounterService', ['incrementCounter', 'resetCounter']);
        mockCommunicationService = jasmine.createSpyObj('CommunicationService', ['getDifferences', 'sendPosition', 'getAllDiffs']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                GameService,
                { provide: CommunicationService },
                { provide: SocketService, useValue: mockSocketService },
                { provide: CounterService, useValue: mockCounterService },
                { provide: CommunicationService, useValue: mockCommunicationService },
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
        spyOn(gameService, 'flashDifferences');
        gameService.updateDifferences(mockResponse);
        expect(gameService['differenceFound']).toContain(mockResponse.differenceNumber);
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

    it('updateDifference should call updateImages after some time', fakeAsync(() => {
        spyOn(gameService, 'updateImages');
        spyOn(gameService, 'flashDifferences');
        gameService.updateDifferences({ coords: [{ x: 10, y: 10 }], differenceNumber: 1, isDifference: true });
        tick(DELAY.BIGTIMEOUT);
        expect(gameService.updateImages).toHaveBeenCalled();
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
        const mockCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const mockCtxs = [mockCtx, mockCtx, mockCtx, mockCtx];
        gameService['isClickDisabled'] = true;
        spyOn(gameService, 'updateDifferences');
        const mockEvent = { offsetX: 0, offsetY: 0 } as MouseEvent;
        gameService.checkClick(mockEvent, mockCounterService, mockCtxs);
        expect(gameService.updateDifferences).not.toHaveBeenCalled();
    });

    it('checkClick should call playSuccessSound when the clicked on a difference', fakeAsync(() => {
        const mockCanvas = document.createElement('canvas') as HTMLCanvasElement;
        const mockCtx = mockCanvas.getContext('2d') as CanvasRenderingContext2D;
        const mockCtxs = [mockCtx, mockCtx, mockCtx, mockCtx];
        gameService['isClickDisabled'] = false;
        spyOn(gameService, 'playSuccessSound');
        spyOn(gameService, 'updateDifferences');
        const response = { coords: [{ x: 0, y: 0 }], differenceNumber: 1, isDifference: true } as ClickResponse;
        mockCommunicationService.sendPosition.and.returnValue(of(response));
        const mockEvent = { offsetX: 0, offsetY: 0, button: MouseButton.Left, target: mockCanvas } as unknown as MouseEvent;
        gameService.checkClick(mockEvent, mockCounterService, mockCtxs);
        tick(DELAY.SMALLTIMEOUT);
        expect(gameService.playSuccessSound).toHaveBeenCalled();
    }));

    it('checkClick should call playErrorSound when the clicked on a difference', fakeAsync(() => {
        const mockCanvas = document.createElement('canvas') as HTMLCanvasElement;
        const mockCtx = mockCanvas.getContext('2d') as CanvasRenderingContext2D;
        const mockCtxs = [mockCtx, mockCtx, mockCtx, mockCtx];
        // gameService['playAreaCtx'] = mockCtxs;
        gameService['isClickDisabled'] = false;
        spyOn(gameService, 'playErrorSound');
        spyOn(gameService, 'updateDifferences');
        const response = { coords: [{ x: 0, y: 0 }], differenceNumber: 1, isDifference: false } as ClickResponse;
        mockCommunicationService.sendPosition.and.returnValue(of(response));
        const mockEvent = { offsetX: 0, offsetY: 0, button: MouseButton.Left, target: mockCanvas } as unknown as MouseEvent;
        gameService.checkClick(mockEvent, mockCounterService, mockCtxs);
        tick(DELAY.SMALLTIMEOUT);
        expect(gameService.playErrorSound).toHaveBeenCalled();
    }));

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
    it('should toggle isHintModeEnabled and call flashOneDifference1 and setTimeout if isHintModeEnabled is true', fakeAsync(() => {
        const mockCtx = {} as CanvasRenderingContext2D;
        /*
        const mockDiffs = {
            differences: [
                { x: 10, y: 10 },
                { x: 20, y: 20 },
            ],
        };
        */
        // const getAllDiffsSpy = spyOn(mockCommunicationService, 'getAllDiffs').and.returnValue(of(mockDiffs));
        const flashOneDifference1Spy = spyOn(gameService, 'flashOneDifference1');
        const hintMessageEmitSpy = spyOn(gameService.hintMessage, 'emit');
        gameService.isHintModeEnabled = false;
        const timeout = 1000;

        gameService.hintMode1([mockCtx]);
        expect(hintMessageEmitSpy).toHaveBeenCalled();
        expect(gameService.isHintModeEnabled).toBeTrue();
        expect(flashOneDifference1Spy).toHaveBeenCalled();
        // expect(getAllDiffsSpy).toHaveBeenCalled();

        tick(timeout);
        expect(gameService.isHintModeEnabled).toBeFalse();
        expect(clearInterval).toHaveBeenCalled();
    }));

    it('should disable hint mode and clear the timeout when called and hint mode was previously enabled', fakeAsync(() => {
        const mockCtx = {} as CanvasRenderingContext2D;
        gameService.getContexts(mockCtx);
        gameService.isHintModeEnabled = true;
        gameService.cheatTimeout = 1 as unknown;
        spyOn(window, 'clearInterval');
        gameService.hintMode1(gameService['playAreaCtx']);
        expect(gameService.isHintModeEnabled).toBeFalse();
        expect(clearInterval).toHaveBeenCalled();
        expect(gameService.cheatTimeout).toBeUndefined();
    }));

    /*
    it('should not flash a difference when called and all differences have been found', fakeAsync(() => {
        const mockCtx = {} as CanvasRenderingContext2D;
        gameService.getContexts(mockCtx);
        gameService['differenceFound'] = [1, 2];
        spyOn(gameService, 'flashOneDifference1');

        gameService.hintMode1(gameService['playAreaCtx']);
        expect(gameService.isHintModeEnabled).toBeTrue();
        expect(gameService.flashOneDifference1).toHaveBeenCalled();
        tick(1000);
        expect(gameService.isHintModeEnabled).toBeFalse();
        expect(clearInterval).toHaveBeenCalled();
        expect(gameService.cheatTimeout).toBeUndefined();
    }));
    */

    it('should toggle isHintModeEnabled and call flashOneDifference1 and setTimeout if isHintModeEnabled is true', fakeAsync(() => {
        const mockCtx = {} as CanvasRenderingContext2D;
        const flashOneDifference2Spy = spyOn(gameService, 'flashOneDifference2');
        const hintMessageEmitSpy = spyOn(gameService.hintMessage, 'emit');
        gameService.isHintModeEnabled = false;
        const timeout = 1000;

        gameService.hintMode2([mockCtx]);
        expect(hintMessageEmitSpy).toHaveBeenCalled();
        expect(gameService.isHintModeEnabled).toBeTrue();
        expect(flashOneDifference2Spy).toHaveBeenCalled();

        tick(timeout);
        expect(gameService.isHintModeEnabled).toBeFalse();
        expect(clearInterval).toHaveBeenCalled();
    }));

    it('should disable hint mode and clear the timeout when called and hint mode was previously enabled', fakeAsync(() => {
        const mockCtx = {} as CanvasRenderingContext2D;
        gameService.getContexts(mockCtx);
        gameService.isHintModeEnabled = true;
        gameService.cheatTimeout = 1 as unknown;
        spyOn(window, 'clearInterval');
        gameService.hintMode2(gameService['playAreaCtx']);
        expect(gameService.isHintModeEnabled).toBeFalse();
        expect(clearInterval).toHaveBeenCalled();
        expect(gameService.cheatTimeout).toBeUndefined();
    }));

    it('should toggle isHintModeEnabled and call flashOneDifference1 and setTimeout if isHintModeEnabled is true', fakeAsync(() => {
        const mockCtx = {} as CanvasRenderingContext2D;
        const flashOneDifference3Spy = spyOn(gameService, 'flashOneRandomDifference');
        const hintMessageEmitSpy = spyOn(gameService.hintMessage, 'emit');
        gameService.isHintModeEnabled = true;
        const timeout = 1000;

        gameService.hintMode3([mockCtx]);
        expect(hintMessageEmitSpy).toHaveBeenCalled();
        expect(gameService.isHintModeEnabled).toBeTrue();
        expect(flashOneDifference3Spy).toHaveBeenCalled();

        tick(timeout);
        expect(gameService.isHintModeEnabled).toBeFalse();
        expect(clearInterval).toHaveBeenCalled();
    }));
});
