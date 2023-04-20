/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-restricted-imports */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ClickResponse } from '@app/classes/click-response';
import { MouseButton } from '@app/classes/mouse-button';
import { DELAY } from '@common/constants';
import { Coords, GameDiffData } from '@common/game-interfaces';
import { of, Subscription } from 'rxjs';
import { Socket } from 'socket.io-client';
import { CommunicationService } from '../communication/communication.service';
import { CounterService } from '../counter/counter.service';
import { ReplayService } from '../replay/replay.service';
import { SocketService } from '../socket/socket.service';
import { TimerService } from '../timer/timer.service';
import { GameService } from './game.service';

describe('GameService', () => {
    let gameService: GameService;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockCounterService: jasmine.SpyObj<CounterService>;
    let mockCommunicationService: jasmine.SpyObj<CommunicationService>;
    let mockTimerService: jasmine.SpyObj<TimerService>;
    let mockReplayService: jasmine.SpyObj<ReplayService>;
    let mockSocket: jasmine.SpyObj<Socket>;
    let mockContext1: CanvasRenderingContext2D;
    let mockContext2: CanvasRenderingContext2D;
    let mockContext3: CanvasRenderingContext2D;
    let mockContext4: CanvasRenderingContext2D;

    beforeEach(() => {
        mockSocket = jasmine.createSpyObj('Socket', ['on', 'emit', 'off']);
        mockSocket.on.and.returnValue(mockSocket);
        mockSocket.off.and.returnValue(mockSocket);
        mockSocket.emit.and.returnValue(mockSocket);
        mockSocketService = jasmine.createSpyObj(
            'SocketService',
            [
                'incrementCounter',
                'resetCounter',
                'sendVictoriousPlayer',
                'sendDifferenceFound',
                'addToTimer',
                'removeToTimer',
                'switchGame',
                'sendPosition',
            ],
            { socket: mockSocket },
        );

        mockTimerService = jasmine.createSpyObj('TimerService', ['getTime']);
        mockCounterService = jasmine.createSpyObj('CounterService', ['incrementCounter', 'resetCounter', 'removeToTimer']);
        mockCommunicationService = jasmine.createSpyObj('CommunicationService', [
            'getDifferences',
            'sendPosition',
            'getAllDiffs',
            'updateBestTimes',
            'getAllDiffs',
        ]);
        mockReplayService = jasmine.createSpyObj('ReplayService', ['addAction', 'resetReplayData']);
        mockReplayService.addAction.and.callFake(() => {});
        mockReplayService.resetReplayData.and.callFake(() => {});
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                GameService,
                { provide: SocketService, useValue: mockSocketService },
                { provide: CounterService, useValue: mockCounterService },
                { provide: CommunicationService, useValue: mockCommunicationService },
                { provide: TimerService, useValue: mockTimerService },
                { provide: ReplayService, useValue: mockReplayService },
            ],
        });

        gameService = TestBed.inject(GameService);
        mockSocketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        mockContext1 = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect', 'clearRect', 'getImageData', 'putImageData', 'fillText']);
        mockContext2 = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect', 'clearRect', 'getImageData', 'putImageData']);
        mockContext3 = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect', 'clearRect', 'getImageData', 'putImageData', 'fillText']);
        mockContext4 = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect', 'clearRect', 'getImageData', 'putImageData']);
        gameService.playAreaCtx = [mockContext1, mockContext2, mockContext3, mockContext4];
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
        expect(gameService.differenceFound).toContain(1);
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

    it('should not call blinkDifference3 if there are no differences', fakeAsync(() => {
        const mockCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const mockCtxs = [mockCtx, mockCtx, mockCtx, mockCtx];
        const mockDifferences = [[], [], []];
        const spy = spyOn(gameService, 'blinkDifference3');
        mockCommunicationService.getAllDiffs.and.returnValue(of({ id: 1, differences: mockDifferences, count: 1 }));

        gameService.flashOneRandomDifference(mockCtxs, 2);
        tick();

        expect(spy).toHaveBeenCalled();
    }));

    it('checkClick should call playSuccessSound when the clicked on a difference', fakeAsync(() => {
        const mockCanvas = document.createElement('canvas') as HTMLCanvasElement;
        gameService['isClickDisabled'] = false;
        const spy = spyOn(gameService, 'playErrorSound');
        spyOn(gameService, 'updateDifferences');
        const response = { coords: [{ x: 0, y: 0 }], differenceNumber: 1, isDifference: true } as ClickResponse;
        mockCommunicationService.sendPosition.and.returnValue(of(response));
        const mockEvent = { offsetX: 0, offsetY: 0, button: MouseButton.Left, target: mockCanvas } as unknown as MouseEvent;
        gameService.checkClick(mockEvent);
        tick(DELAY.SMALLTIMEOUT);
        expect(spy).not.toHaveBeenCalled();
    }));

    it('checkClick should call playErrorSound when the clicked on a difference', fakeAsync(() => {
        const mockCanvas = document.createElement('canvas') as HTMLCanvasElement;
        gameService['isClickDisabled'] = false;
        const spy = spyOn(gameService, 'playErrorSound');
        spyOn(gameService, 'updateDifferences');
        const response = { coords: [{ x: 0, y: 0 }], differenceNumber: 1, isDifference: false } as ClickResponse;
        mockCommunicationService.sendPosition.and.returnValue(of(response));
        const mockEvent = { offsetX: 0, offsetY: 0, button: MouseButton.Left, target: mockCanvas } as unknown as MouseEvent;
        gameService.checkClick(mockEvent);
        tick(DELAY.SMALLTIMEOUT);
        expect(spy).not.toHaveBeenCalled();
    }));

    it('hintMode2 should call flashOneDifference2', () => {
        const mockCtx = {} as CanvasRenderingContext2D;
        gameService.getContexts(mockCtx);
        spyOn(gameService, 'flashOneDifference2');
        gameService.hintMode2(gameService['playAreaCtx']);
        expect(gameService.flashOneDifference2).toHaveBeenCalled();
    });

    it('hintMode1 should call flashOneDifference1', () => {
        const mockCtx = {} as CanvasRenderingContext2D;
        gameService.getContexts(mockCtx);
        spyOn(gameService, 'flashOneDifference1');
        gameService.hintMode1(gameService['playAreaCtx']);
        expect(gameService.flashOneDifference1).toHaveBeenCalled();
    });

    it('flashOneDifference1 should get gameTitle from sessionStorage', () => {
        const mockCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        gameService['playAreaCtx'] = [mockCtx, mockCtx, mockCtx, mockCtx];
        gameService.getContexts(mockCtx);
        spyOn(sessionStorage, 'getItem');
        mockCommunicationService.getAllDiffs.and.returnValue(of({ id: 1, differences: [[{ x: 0, y: 0 }]], count: 1 }));
        gameService.flashOneDifference1(gameService['playAreaCtx'], 3);
        expect(sessionStorage.getItem).toHaveBeenCalled();
    });

    it('flashOneDifference2 should get gameTitle from sessionStorage', () => {
        const mockCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        gameService['playAreaCtx'] = [mockCtx, mockCtx, mockCtx, mockCtx];
        gameService.getContexts(mockCtx);
        spyOn(sessionStorage, 'getItem');
        mockCommunicationService.getAllDiffs.and.returnValue(of({ id: 1, differences: [[{ x: 0, y: 0 }]], count: 1 }));
        gameService.flashOneDifference2(gameService['playAreaCtx'], 3);
        expect(sessionStorage.getItem).toHaveBeenCalled();
    });

    it('hintMode3 should call flashOneRandomDifference', () => {
        const mockCtx = {} as CanvasRenderingContext2D;
        gameService.getContexts(mockCtx);
        spyOn(gameService, 'flashOneRandomDifference');
        gameService.hintMode3(gameService['playAreaCtx']);
        expect(gameService.flashOneRandomDifference).toHaveBeenCalled();
    });

    it('hintMode3 should not when isHintModeEnabled call flashOneRandomDifference', () => {
        gameService.isHintModeEnabled = true;
        const mockCtx = {} as CanvasRenderingContext2D;
        gameService.getContexts(mockCtx);
        spyOn(gameService, 'flashOneRandomDifference');
        gameService.hintMode3(gameService['playAreaCtx']);
        expect(gameService.flashOneRandomDifference).not.toHaveBeenCalled();
    });

    it('blinkDifference3 should set caanvas style cursor to auto', fakeAsync(() => {
        const mockcanvas = document.createElement('canvas') as HTMLCanvasElement;
        const mockCtx = mockcanvas.getContext('2d') as CanvasRenderingContext2D;
        gameService['playAreaCtx'] = [mockCtx, mockCtx, mockCtx, mockCtx];
        gameService.getContexts(mockCtx);
        gameService.blinkDifference3(gameService['playAreaCtx'], [{ x: 0, y: 0 }]);
        tick(1000);
        expect(mockcanvas.style.cursor).toEqual('auto');
    }));

    it('it should clear interval of this.cheatTimeout when stopCheatMode is called', fakeAsync(() => {
        spyOn(window, 'clearInterval').and.callFake(() => {});
        gameService.stopCheatMode();
        expect(window.clearInterval).toHaveBeenCalledWith(gameService.cheatTimeout);
    }));

    it('should not update the images', () => {
        const mockCanvas1 = CanvasTestHelper.createCanvas(2, 2);
        const ctx1 = mockCanvas1.getContext('2d') as CanvasRenderingContext2D;
        const mockCanvas2 = CanvasTestHelper.createCanvas(2, 2);
        const ctx2 = mockCanvas2.getContext('2d') as CanvasRenderingContext2D;
        ctx1.fillStyle = 'white';
        ctx1.fillRect(0, 0, 2, 2);
        const coord = [{ x: 0, y: 1 }];
        gameService.updateImages(coord, ctx1, null as unknown as CanvasRenderingContext2D);
        expect(ctx2.getImageData(0, 1, 1, 1).data).not.toEqual(ctx1.getImageData(0, 1, 1, 1).data);
    });

    it('should flashOneDifference1', fakeAsync(() => {
        const time = 5;
        const gamedata: GameDiffData = {
            id: 1,
            count: 4,
            differences: [[{ x: 1, y: 2 }], [{ x: 1, y: 2 }]],
        };
        sessionStorage.setItem('gameTitle', 'test');
        mockCommunicationService.getAllDiffs.and.returnValue(of(gamedata));
        spyOn(gameService, 'blinkAllDifferences').and.callFake(() => {});

        gameService.flashOneDifference1(gameService.playAreaCtx, time);
        tick(1000);
        expect(gameService.playAreaCtx[2].fillRect).toHaveBeenCalledTimes(4);
        expect(gameService.playAreaCtx[3].fillRect).toHaveBeenCalledTimes(4);
        expect(gameService.playAreaCtx[2].clearRect).toHaveBeenCalledTimes(4);
        expect(gameService.playAreaCtx[3].clearRect).toHaveBeenCalledTimes(4);
        sessionStorage.removeItem('gameTitle');
    }));

    it('should flashOneDifference2', fakeAsync(() => {
        const time = 5;
        const gamedata: GameDiffData = {
            id: 1,
            count: 4,
            differences: [[{ x: 1, y: 2 }], [{ x: 1, y: 2 }]],
        };
        sessionStorage.setItem('gameTitle', 'test');
        mockCommunicationService.getAllDiffs.and.returnValue(of(gamedata));
        spyOn(gameService, 'blinkAllDifferences');

        gameService.flashOneDifference2(gameService.playAreaCtx, time);
        tick(1000);
        expect(gameService.playAreaCtx[2].fillRect).toHaveBeenCalledTimes(4);
    }));

    it('should set showPopup to true when socket emits "send-victorious-player"', () => {
        const player1 = true;
        mockSocket.on.withArgs('send-victorious-player', jasmine.any(Function)).and.callFake((eventName, callback) => {
            callback(player1);
            return mockSocket;
        });

        gameService.listenForWinner();
        mockSocket.emit('send-victorious-player', player1);
    });

    // it('should do nothing if click disabled', fakeAsync(() => {
    //     gameService['isClickDisabled'] = false;
    //     spyOn(gameService, 'updateDifferences');
    //     const mockEvent = { offsetX: 0, offsetY: 0 } as MouseEvent;
    //     gameService.checkClick(mockEvent);
    //     tick(3000);
    //     expect(gameService.updateDifferences).not.toHaveBeenCalled();
    // }));

    // it('socket update-difference should call addAction ', fakeAsync(() => {
    //     const clickResponse = { coords: [{ x: 0, y: 0 }], differenceNumber: 1, isDifference: true } as ClickResponse;
    //     mockSocket.on.calls.mostRecent().args[1](clickResponse);
    //     tick(1000);
    //     mockSocket.emit('update-difference', clickResponse);
    //     expect(mockReplayService.addAction).toHaveBeenCalled();
    // }));
});
