import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { CANVAS, DELAY } from '@common/constants';
import { GameDiffData } from '@common/game-interfaces';
import { of } from 'rxjs';
import { CanvasTestHelper } from '../../classes/canvas-test-helper';
import { CommunicationService } from '../communication/communication.service';
import { CanvasReplayService } from './canvas-replay.service';

describe('CanvasReplayService', () => {
    let service: CanvasReplayService;
    let mockCommunicationService: jasmine.SpyObj<CommunicationService>;
    // let mockCoords: Coords[];
    let mockContext1: CanvasRenderingContext2D;
    let mockContext2: CanvasRenderingContext2D;

    beforeEach(() => {
        mockCommunicationService = jasmine.createSpyObj('CommunicationService', ['getDifferences', 'sendPosition', 'getAllDiffs', 'updateBestTimes']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CanvasReplayService, { provide: CommunicationService, useValue: mockCommunicationService }],
        });
        service = TestBed.inject(CanvasReplayService);
        mockContext1 = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect', 'clearRect', 'getImageData', 'putImageData', 'fillText']);
        mockContext2 = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect', 'clearRect', 'getImageData', 'putImageData']);
        service.contexts = [mockContext1, mockContext2];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update replay speed', () => {
        const speed = 2;
        service.updateReplaySpeed(speed);
        expect(service.replaySpeed).toEqual(speed);
    });

    it('should update differences', fakeAsync(() => {
        const coord = [{ x: 1, y: 2 }];
        spyOn(service, 'flashDifferences');
        spyOn(service, 'updateImages');

        service.updateDifferences(coord);
        tick(3000);
        expect(service.updateImages).toHaveBeenCalled();
    }));

    it('should play the error sound', () => {
        spyOn(service.errorSound, 'play');
        service.playErrorSound();
        expect(service.errorSound.currentTime).toBe(0);
        expect(service.errorSound.playbackRate).toBe(service.replaySpeed);
        expect(service.errorSound.play).toHaveBeenCalled();
    });

    it('should play the success sound', () => {
        spyOn(service.successSound, 'play');
        service.playSuccessSound();
        expect(service.successSound.currentTime).toBe(0);
        expect(service.successSound.playbackRate).toBe(service.replaySpeed);
        expect(service.successSound.play).toHaveBeenCalled();
    });

    it('should set fillStyle and fillText to green and "Trouvé" respectively', () => {
        const context = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillText']);
        spyOn(service, 'playSuccessSound');

        service.foundPopup({ x: 10, y: 10 }, context);

        expect(context.fillStyle).toEqual('green');
        expect(context.fillText).toHaveBeenCalledWith('Trouvé', 10, 10);
        expect(service.playSuccessSound).toHaveBeenCalled();
    });

    it('should update the images', () => {
        const mockCanvas1 = CanvasTestHelper.createCanvas(2, 2);
        const ctx1 = mockCanvas1.getContext('2d') as CanvasRenderingContext2D;
        const mockCanvas2 = CanvasTestHelper.createCanvas(2, 2);
        const ctx2 = mockCanvas2.getContext('2d') as CanvasRenderingContext2D;
        ctx1.fillStyle = 'white';
        ctx1.fillRect(0, 0, 2, 2);
        const coord = [{ x: 0, y: 1 }];
        service.updateImages(coord, ctx1, ctx2);
        expect(ctx2.getImageData(0, 1, 1, 1).data).toEqual(ctx1.getImageData(0, 1, 1, 1).data);
    });

    it('should not update the images', () => {
        const mockCanvas1 = CanvasTestHelper.createCanvas(2, 2);
        const ctx1 = mockCanvas1.getContext('2d') as CanvasRenderingContext2D;
        const mockCanvas2 = CanvasTestHelper.createCanvas(2, 2);
        const ctx2 = mockCanvas2.getContext('2d') as CanvasRenderingContext2D;
        ctx1.fillStyle = 'white';
        ctx1.fillRect(0, 0, 2, 2);
        const coord = [{ x: 0, y: 1 }];
        service.updateImages(coord, null as unknown as CanvasRenderingContext2D, ctx2);
        expect(ctx2.getImageData(0, 1, 1, 1).data).not.toEqual(ctx1.getImageData(0, 1, 1, 1).data);
    });

    it('should not update the images', () => {
        const mockCanvas1 = CanvasTestHelper.createCanvas(2, 2);
        const ctx1 = mockCanvas1.getContext('2d') as CanvasRenderingContext2D;
        const mockCanvas2 = CanvasTestHelper.createCanvas(2, 2);
        const ctx2 = mockCanvas2.getContext('2d') as CanvasRenderingContext2D;
        ctx1.fillStyle = 'white';
        ctx1.fillRect(0, 0, 2, 2);
        const coord = [{ x: 0, y: 1 }];
        service.updateImages(coord, ctx1, null as unknown as CanvasRenderingContext2D);
        expect(ctx2.getImageData(0, 1, 1, 1).data).not.toEqual(ctx1.getImageData(0, 1, 1, 1).data);
    });

    it('should set fillStyle and fillText to red and "Erreur" respectively', fakeAsync(() => {
        spyOn(service, 'playErrorSound');

        service.errorPopup({ x: 20, y: 20 }, service.contexts[0]);
        tick(2000);

        expect(service.contexts[0].fillStyle).toEqual('red');
        expect(service.contexts[0].fillText).toHaveBeenCalledWith('Erreur', 20, 20);
        expect(service.playErrorSound).toHaveBeenCalled();
    }));

    it('should add context to the contexts array', () => {
        const ctxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect']);
        service.getContexts(ctxSpy);

        expect(service.contexts.length).toEqual(3);
    });

    it('should set fillStyle to rgba(255, 0, 255, 0.4) on both contexts', () => {
        service.flashDifferences([]);

        expect(mockContext1.fillStyle).toEqual('rgba(255, 0, 255, 0.4)');
        expect(mockContext2.fillStyle).toEqual('rgba(255, 0, 255, 0.4)');
    });

    it('should call clearRect on both contexts after a delay', fakeAsync(() => {
        service.replaySpeed = 2;
        const coords = [{ x: 10, y: 10 }];
        service.flashDifferences(coords);

        tick(DELAY.MINITIMEOUT / 2);
        expect(mockContext1.clearRect).not.toHaveBeenCalled();
        expect(mockContext2.clearRect).not.toHaveBeenCalled();

        tick(DELAY.SMALLTIMEOUT / 2);
        expect(mockContext1.clearRect).toHaveBeenCalledWith(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
        expect(mockContext2.clearRect).toHaveBeenCalledWith(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);

        flush();
    }));

    it('should clear the interval after a delay', fakeAsync(() => {
        service.replaySpeed = 2;
        spyOn(window, 'clearInterval').and.callThrough();
        service.flashDifferences([]);

        tick(DELAY.SMALLTIMEOUT / 2);
        expect(window.clearInterval).toHaveBeenCalled();

        tick(DELAY.SMALLTIMEOUT / 2);
        expect(window.clearInterval).toHaveBeenCalled();
    }));

    it('should flash all differences', fakeAsync(() => {
        const differences = [1, 2];
        const gamedata: GameDiffData = {
            id: 1,
            count: 4,
            differences: [[{ x: 1, y: 2 }], [{ x: 1, y: 2 }]],
        };
        sessionStorage.setItem('gameTitle', 'Monkey');
        mockCommunicationService.getAllDiffs.and.returnValue(of(gamedata));
        spyOn(service, 'blinkAllDifferences');

        service.flashAllDifferences(differences);
        expect(service.blinkAllDifferences).toHaveBeenCalled();
        sessionStorage.removeItem('gameTitle');
    }));

    it('should blink all differences', fakeAsync(() => {
        const differences = [6, 7];
        const gameData = { differences: [[{ x: 10, y: 10 }]] } as GameDiffData;
        spyOn(service, 'flashDifferences');
        service.blinkAllDifferences(differences, gameData);
        tick(DELAY.SMALLTIMEOUT);
        expect(service.contexts[0].fillRect).toHaveBeenCalledTimes(4);
    }));

    it('should flashOneDifference1', fakeAsync(() => {
        const randomDifference = [{ x: 1, y: 2 }];
        const differences = [6, 7];
        const gamedata: GameDiffData = {
            id: 1,
            count: 4,
            differences: [[{ x: 1, y: 2 }], [{ x: 1, y: 2 }]],
        };
        sessionStorage.setItem('gameTitle', 'test');
        mockCommunicationService.getAllDiffs.and.returnValue(of(gamedata));
        spyOn(service, 'blinkAllDifferences');

        service.flashOneDifference1(randomDifference, differences);
        tick(1000);
        expect(service.contexts[0].fillRect).toHaveBeenCalledTimes(4);
        expect(service.contexts[1].fillRect).toHaveBeenCalledTimes(4);
        expect(service.contexts[0].clearRect).toHaveBeenCalledTimes(4);
        expect(service.contexts[0].clearRect).toHaveBeenCalledTimes(4);
        sessionStorage.removeItem('gameTitle');
    }));

    it('should flashOneDifference2', fakeAsync(() => {
        const randomIndex = 0;
        const differences = [6, 7];
        const gamedata: GameDiffData = {
            id: 1,
            count: 4,
            differences: [[{ x: 1, y: 2 }], [{ x: 1, y: 2 }]],
        };
        sessionStorage.setItem('gameTitle', 'test');
        mockCommunicationService.getAllDiffs.and.returnValue(of(gamedata));
        spyOn(service, 'blinkAllDifferences');

        service.flashOneDifference2(randomIndex, differences);
        tick(1000);
        expect(service.contexts[0].fillRect).toHaveBeenCalledTimes(4);
    }));

    it('should flash all differences', () => {
        service.clearContexts();
        expect(service.contexts.length).toEqual(0);
        expect(service.replaySpeed).toEqual(1);
    });
});
