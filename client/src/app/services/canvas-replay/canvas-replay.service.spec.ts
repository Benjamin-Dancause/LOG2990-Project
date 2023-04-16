import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { Coords } from '@app/classes/coords';
import { CANVAS, DELAY } from '@common/constants';
import { CanvasReplayService } from './canvas-replay.service';

describe('CanvasReplayService', () => {
    let service: CanvasReplayService;
    // let mockCoords: Coords[];
    let mockContext1: CanvasRenderingContext2D;
    let mockContext2: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasReplayService);
        mockContext1 = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect', 'clearRect']);
        mockContext2 = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect', 'clearRect']);
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

    it('should update the images with the differences', () => {
        const coords = [
            { x: 10, y: 20 },
            { x: 30, y: 40 },
        ];
        const ctxLeft = jasmine.createSpyObj('ctxLeft', ['getImageData']);
        ctxLeft.getImageData.and.returnValues(
            { data: [255, 0, 0, 255] }, // pixel at (10, 20)
            { data: [0, 255, 0, 255] }, // pixel at (30, 40)
        );
        const ctxRight = jasmine.createSpyObj('ctxRight', ['putImageData']);

        service.updateImages(coords, ctxLeft, ctxRight);

        expect(ctxLeft.getImageData).toHaveBeenCalledWith(10, 20, 1, 1);
        // expect(ctxRight.putImageData).toHaveBeenCalledWith(new ImageData([255, 0, 0, 255], 1, 1), 10, 20);
        expect(ctxLeft.getImageData).toHaveBeenCalledWith(30, 40, 1, 1);
        // expect(ctxRight.putImageData).toHaveBeenCalledWith(new ImageData([0, 255, 0, 255], 1, 1), 30, 40);
    });

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

    // donne une erreur
    it('should update differences', (done) => {
        const ctx1 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const ctx2 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const ctx3 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const ctx4 = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        spyOn(service, 'flashDifferences').and.callFake(() => {
            setTimeout(() => {
                expect(service.contexts[2]).toEqual(ctx3);
                expect(service.contexts[3]).toEqual(ctx4);
                done();
            }, DELAY.BIGTIMEOUT / service.replaySpeed);
        });

        service.contexts.push(ctx1, ctx2, ctx3, ctx4);
        service.updateDifferences([new Coords(0, 0)]);
    });

    it('should set fillStyle and fillText to red and "Erreur" respectively', () => {
        const context = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillText']);
        spyOn(service, 'playErrorSound');

        service.errorPopup({ x: 20, y: 20 }, context);

        expect(context.fillStyle).toEqual('red');
        expect(context.fillText).toHaveBeenCalledWith('Erreur', 20, 20);
        expect(service.playErrorSound).toHaveBeenCalled();
    });

    it('should add context to the contexts array', () => {
        const ctxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect']);
        service.getContexts(ctxSpy);

        expect(service.contexts.length).toEqual(1);
    });

    it('should set fillStyle to rgba(255, 0, 255, 0.4) on both contexts', () => {
        service.flashDifferences([]);

        expect(mockContext1.fillStyle).toEqual('rgba(255, 0, 255, 0.4)');
        expect(mockContext2.fillStyle).toEqual('rgba(255, 0, 255, 0.4)');
    });

    // donne une erreur
    it('should call fillRect on both contexts with the correct coordinates', () => {
        const coords = [
            { x: 10, y: 10 },
            { x: 20, y: 20 },
        ];
        service.flashDifferences(coords);

        for (const coordinate of coords) {
            expect(mockContext1.fillRect).toHaveBeenCalledWith(coordinate.x, coordinate.y, 1, 1);
            expect(mockContext2.fillRect).toHaveBeenCalledWith(coordinate.x, coordinate.y, 1, 1);
        }
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

    // pas sure pour elle
    /*
    it('should clear the contexts array', () => {
        const ctxSpy1 = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect']);
        const ctxSpy2 = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect']);
        service.getContexts(ctxSpy1);
        service.getContexts(ctxSpy2);

        service.clearContexts();

        expect(service.contexts.length).toEqual(0);
    });
    */
});
