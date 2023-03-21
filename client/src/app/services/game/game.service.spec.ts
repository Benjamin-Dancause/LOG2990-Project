import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ClickResponse } from '@app/classes/click-response';
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
  let mockCounter: jasmine.SpyObj<CounterService>;

  beforeEach(() => {
    //const communicationSpy = jasmine.createSpyObj('CommuncationService', );
    mockSocketService = jasmine.createSpyObj('SocketService', ['incrementCounter', 'resetCounter', 'sendVictoriousPlayer']);
    mockSocketService.socket = jasmine.createSpyObj('Socket', ['on']);
    mockCounter = jasmine.createSpyObj('CounterService', ['incrementCounter', 'resetCounter']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
          GameService,
          { provide: CommunicationService},
          { provide: SocketService, useValue: mockSocketService },
          { provide: CounterService, useValue: mockCounter }
      ],
  });

    gameService = TestBed.inject(GameService);
    // socketService = TestBed.inject(SocketService);
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

  it('should flash all differences on canvas', fakeAsync(() => {
    const mockCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const mockCtxs = [mockCtx, mockCtx, mockCtx, mockCtx];
    const gameDiffData = {differences:[[{ x: 10, y: 10 }]]} as GameDiffData;
    spyOn(gameService['communicationService'], 'getAllDiffs').and.returnValue(of(gameDiffData));
    const fillRectSpy = spyOn(mockCtx, 'fillRect').and.callThrough();
    const clearRectSpy = spyOn(mockCtx, 'clearRect').and.callThrough();
    gameService.flashAllDifferences(mockCtxs);
    tick(DELAY.SMALLTIMEOUT);
    expect(fillRectSpy).toHaveBeenCalledTimes(8);
    expect(clearRectSpy).toHaveBeenCalledTimes(8);
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
    const mockCtx1 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const mockCtx2 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const mockCtx3 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const mockCtx4 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const mockCtxs = [mockCtx1, mockCtx2, mockCtx3, mockCtx4];
    gameService['isClickDisabled'] = true;
    spyOn(gameService, 'updateDifferences');
    const mockEvent = { offsetX: 0, offsetY: 0 } as MouseEvent;
    gameService.checkClick(mockEvent, mockCounter, mockCtxs);
    expect(gameService.updateDifferences).not.toHaveBeenCalled();
  });

  it('should execute properly when click on a difference',fakeAsync( () => {
    const mockCtx1 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const mockCtx2 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const mockCtx3 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const mockCtx4 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const mockCtxs = [mockCtx1, mockCtx2, mockCtx3, mockCtx4];
    const coord = { x: 0, y: 0 } as Coords;
    const response = { coords: [coord], differenceNumber: 1, isDifference: true } as ClickResponse;
    spyOn(gameService['communicationService'], 'sendPosition').and.returnValue(of(response));
    spyOn(gameService['successSound'], 'play');
    const mockEvent = { offsetX: 0, offsetY: 0 } as MouseEvent;
    gameService.checkClick(mockEvent, mockCounter, mockCtxs);
    expect(gameService['isClickDisabled']).toBeFalse();
    expect(gameService['socketService'].sendDifferenceFound).toHaveBeenCalled;
    expect(gameService['counterService'].incrementCounter).toHaveBeenCalled;
    expect(gameService['successSound'].play()).toHaveBeenCalled;
  }));

  it('should execute properly when click on a non-difference', fakeAsync(() => {
    const mockCtx1 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const mockCtx2 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const mockCtx3 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const mockCtx4 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    const mockCtxs = [mockCtx1, mockCtx2, mockCtx3, mockCtx4];
    const coord = { x: 0, y: 0 } as Coords;
    const response = { coords: [coord], differenceNumber: 1, isDifference: false } as ClickResponse;
    spyOn(gameService['communicationService'], 'sendPosition').and.returnValue(of(response));
    spyOn(gameService['errorSound'], 'play');
    const emitSpy = spyOn(gameService['errorMessage'], 'emit');
    const mockEvent = { offsetX: 0, offsetY: 0 } as MouseEvent;
    gameService.checkClick(mockEvent, mockCounter, mockCtxs);
    expect(gameService['socketService'].sendDifferenceFound).toHaveBeenCalled;
    expect(gameService['counterService'].incrementCounter).toHaveBeenCalled;
    expect(gameService['errorSound'].play()).toHaveBeenCalled;
    expect(emitSpy).toHaveBeenCalled;
    expect(gameService['isClickDisabled']).toBeFalse();
  }));


  

  
  
});
