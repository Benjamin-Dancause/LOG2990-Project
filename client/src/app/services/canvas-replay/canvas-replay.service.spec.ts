import { TestBed } from '@angular/core/testing';
import { Coords } from '@app/classes/coords';
import { DELAY } from '@common/constants';
import { CanvasReplayService } from './canvas-replay.service';

describe('CanvasReplayService', () => {
    let service: CanvasReplayService;
    let mockCoords: Coords[];

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasReplayService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update replay speed', () => {
        const speed = 2;
        service.updateReplaySpeed(speed);
        expect(service.replaySpeed).toEqual(speed);
    });

    it('should update differences', () => {
        const spyFlashDifferences = spyOn(service, 'flashDifferences').and.callThrough();
        const spyUpdateImages = spyOn(service, 'updateImages').and.callThrough();
        service.updateDifferences(mockCoords);
        expect(spyFlashDifferences).toHaveBeenCalled();
        expect(spyUpdateImages).toHaveBeenCalledWith(mockCoords, service.contexts[2], service.contexts[3]);
    });

    it('should flash differences', () => {
        const spyFillRect = spyOn(service.contexts[0], 'fillRect').and.callThrough();
        service.flashDifferences(mockCoords);
        expect(service.contexts[0].fillStyle).toEqual('rgba(255, 0, 255, 0.4)');
        expect(service.contexts[1].fillStyle).toEqual('rgba(255, 0, 255, 0.4)');
        expect(spyFillRect).toHaveBeenCalledTimes(mockCoords.length * 2);
    });

    it('should show found popup and play success sound', () => {
        const spyFillText = spyOn(service.contexts[2], 'fillText').and.callThrough();
        const spyPlaySuccessSound = spyOn(service, 'playSuccessSound').and.callThrough();
        service.foundPopup(mockCoords[0], service.contexts[2]);
        expect(service.contexts[2].fillStyle).toEqual('green');
        expect(spyFillText).toHaveBeenCalled();
        expect(spyPlaySuccessSound).toHaveBeenCalled();
    });

    it('should show error popup and play error sound', () => {
        const spyFillText = spyOn(service.contexts[2], 'fillText').and.callThrough();
        const spyPlayErrorSound = spyOn(service, 'playErrorSound').and.callThrough();
        service.errorPopup(mockCoords[0], service.contexts[2]);
        expect(service.contexts[2].fillStyle).toEqual('red');
        expect(spyFillText).toHaveBeenCalled();
        expect(spyPlayErrorSound).toHaveBeenCalled();
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

    it('should update images correctly', () => {
        const mockCoords: Coords[] = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        const mockDataLeft = {
            data: [255, 255, 255, 255],
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(service.contexts[2], 'getImageData').and.returnValue(mockDataLeft as any);
        spyOn(service.contexts[3], 'putImageData');
        service.updateImages(mockCoords, service.contexts[2], service.contexts[3]);
        expect(service.contexts[2].getImageData).toHaveBeenCalledWith(mockCoords[0].x, mockCoords[0].y, 1, 1);
        expect(service.contexts[2].getImageData).toHaveBeenCalledWith(mockCoords[1].x, mockCoords[1].y, 1, 1);
        // expect(service.contexts[3].putImageData).toHaveBeenCalledWith(new ImageData(mockDataLeft.data, 1, 1), mockCoords[0].x, mockCoords[0].y);
        // expect(service.contexts[3].putImageData).toHaveBeenCalledWith(new ImageData(mockDataLeft.data, 1, 1), mockCoords[1].x, mockCoords[1].y);
    });

    // c'est bon
    it('should play the error sound', () => {
        spyOn(service.errorSound, 'play');
        service.playErrorSound();
        expect(service.errorSound.currentTime).toBe(0);
        expect(service.errorSound.playbackRate).toBe(service.replaySpeed);
        expect(service.errorSound.play).toHaveBeenCalled();
    });

    // c'est bon
    it('should play the success sound', () => {
        spyOn(service.successSound, 'play');
        service.playSuccessSound();
        expect(service.successSound.currentTime).toBe(0);
        expect(service.successSound.playbackRate).toBe(service.replaySpeed);
        expect(service.successSound.play).toHaveBeenCalled();
    });

    // c'est bon
    it('should set fillStyle and fillText to green and "Trouvé" respectively', () => {
        const context = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillText']);
        spyOn(service, 'playSuccessSound');

        service.foundPopup({ x: 10, y: 10 }, context);

        expect(context.fillStyle).toEqual('green');
        expect(context.fillText).toHaveBeenCalledWith('Trouvé', 10, 10);
        expect(service.playSuccessSound).toHaveBeenCalled();
    });

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

    // c'est bon
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
        expect(service.contexts[0]).toEqual(ctxSpy);
    });

    it('should clear the contexts array', () => {
        const ctxSpy1 = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect']);
        const ctxSpy2 = jasmine.createSpyObj('CanvasRenderingContext2D', ['fillRect']);
        service.getContexts(ctxSpy1);
        service.getContexts(ctxSpy2);

        service.clearContexts();

        expect(service.contexts.length).toEqual(0);
    });
});
