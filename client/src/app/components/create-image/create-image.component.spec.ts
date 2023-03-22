/* eslint-disable max-lines */
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { Router } from '@angular/router';
import { Coords } from '@app/classes/coords';

import { SliderComponent } from '@app/components/slider/slider.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DifferenceService } from '@app/services/difference/difference.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CANVAS } from '@common/constants';
import { of } from 'rxjs';
import { CreateImageComponent } from './create-image.component';

describe('CreateImageComponent', () => {
    let component: CreateImageComponent;
    let fixture: ComponentFixture<CreateImageComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let differenceSpy: jasmine.SpyObj<DifferenceService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let communicationSpy: jasmine.SpyObj<CommunicationService>;
    let drawingSpy: jasmine.SpyObj<DrawingService>;
    const canvas = document.createElement('canvas');

    canvas.width = 640;
    canvas.height = 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    beforeEach(async () => {
        dialogSpy = jasmine.createSpyObj(['open']);
        differenceSpy = jasmine.createSpyObj(['findDifference', 'getDifference', 'isDifficult', 'drawCircle']);
        communicationSpy = jasmine.createSpyObj(['getGameNames', 'imagesPost']);
        routerSpy = jasmine.createSpyObj(['navigate']);
        drawingSpy = jasmine.createSpyObj(['saveAction', 'getLeftDrawing', 'getRightDrawing', 'base64Left', 'base64Right']);
        await TestBed.configureTestingModule({
            imports: [MatSliderModule],
            declarations: [CreateImageComponent, SliderComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: DifferenceService, useValue: differenceSpy },
                { provide: CommunicationService, useValue: communicationSpy },
                { provide: Router, useValue: routerSpy },
                { provide: DrawingService, useValue: drawingSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateImageComponent);
        component = fixture.componentInstance;
        component.originalCanvas.nativeElement = canvas;
        component.modifiableCanvas.nativeElement = canvas;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open the inputDifferentTemplate dialog', () => {
        component.showInputDifferent();
        expect(dialogSpy.open).toHaveBeenCalledWith(component.inputDifferentTemplate, {
            width: '500px',
            height: '250px',
        });
    });

    it('should open the inputSameTemplate dialog', () => {
        component.showInputSame();
        expect(dialogSpy.open).toHaveBeenCalledWith(component.inputSameTemplate, {
            width: '450px',
            height: '200px',
        });
    });

    it('should open the errorTemplate dialog', () => {
        component.showError('test');
        expect(dialogSpy.open).toHaveBeenCalledWith(component.errorTemplate, {
            width: '250px',
            height: '250px',
        });
    });
    it('should open the saveTemplate dialog', () => {
        component.showSave();
        expect(dialogSpy.open).toHaveBeenCalledWith(component.saveTemplate, {
            width: '250px',
            height: '200px',
        });
    });
    it('should return if the event target is not an HTMLInputElement', async () => {
        const fileEvent = new Event('click');

        spyOn(component, 'convertImage').and.returnValue(Promise.resolve({ width: 640, height: 480 } as ImageBitmap));
        spyOn(component, 'verifyBMP').and.returnValue(Promise.resolve(true));
        spyOn(component, 'showError');

        await component.storeOriginal(fileEvent);
        expect(component.convertImage).not.toHaveBeenCalled();
        expect(component.verifyBMP).not.toHaveBeenCalled();
        expect(component.showError).toHaveBeenCalled();
        expect(component.originalImage).not.toBeDefined();
    });

    it('should return if the event target does not have files', async () => {
        const fileEvent = {
            target: {
                files: [],
            },
        };
        spyOn(component, 'convertImage').and.returnValue(Promise.resolve({ width: 640, height: 480 } as ImageBitmap));
        spyOn(component, 'verifyBMP').and.returnValue(Promise.resolve(true));
        spyOn(component, 'showError');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await component.storeOriginal(fileEvent as any);
        expect(component.convertImage).not.toHaveBeenCalled();
        expect(component.verifyBMP).not.toHaveBeenCalled();
        expect(component.showError).toHaveBeenCalled();
        expect(component.originalImage).not.toBeDefined();
    });

    it('should store original image', async () => {
        const input = document.createElement('input');
        input.type = 'file';
        const files = [new File(['test'], 'test.bmp', { type: 'image/bmp' })];
        Object.defineProperty(input, 'files', {
            value: files,
        });

        const fileEvent = {
            target: input as HTMLInputElement,
        };
        spyOn(component, 'verifyBMP').and.returnValue(Promise.resolve(true));
        spyOn(component, 'convertImage').and.returnValue(Promise.resolve({ width: 640, height: 480 } as ImageBitmap));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await component.storeOriginal(fileEvent as any);
        expect(component.originalImage).toBeDefined();
        input.remove();
    });
    it('should not store original image if not bmp', async () => {
        const input = document.createElement('input');
        input.type = 'file';
        const files = [new File(['test'], 'test.jpeg', { type: 'image/jpeg' })];
        Object.defineProperty(input, 'files', {
            value: files,
        });

        const fileEvent = {
            target: input as HTMLInputElement,
        };

        spyOn(component, 'verifyBMP').and.returnValue(Promise.resolve(false));
        spyOn(component, 'convertImage').and.returnValue(Promise.resolve({ width: 640, height: 480 } as ImageBitmap));
        spyOn(component, 'showError');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await component.storeOriginal(fileEvent as any);
        expect(component.verifyBMP).toHaveBeenCalled();
        expect(component.convertImage).not.toHaveBeenCalled();
        expect(component.showError).toHaveBeenCalled();
        expect(component.originalImage).toBeUndefined();
        input.remove();
    });
    it('should return if there is no selected file', async () => {
        const input = document.createElement('input');
        input.type = 'file';
        const files = [null];
        Object.defineProperty(input, 'files', {
            value: files,
        });

        const fileEvent = {
            target: input as HTMLInputElement,
        };
        spyOn(component, 'verifyBMP').and.returnValue(Promise.resolve(false));
        spyOn(component, 'convertImage').and.returnValue(Promise.resolve({ width: 640, height: 480 } as ImageBitmap));
        spyOn(component, 'showError');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await component.storeOriginal(fileEvent as any);
        expect(component.convertImage).not.toHaveBeenCalled();
        expect(component.verifyBMP).not.toHaveBeenCalled();
        expect(component.showError).toHaveBeenCalled();
        expect(component.originalImage).toBeUndefined();
        input.remove();
    });
    // here
    it('should return if the event target is not an HTMLInputElement', async () => {
        const fileEvent = new Event('click');

        spyOn(component, 'convertImage').and.returnValue(Promise.resolve({ width: 640, height: 480 } as ImageBitmap));
        spyOn(component, 'verifyBMP').and.returnValue(Promise.resolve(true));
        spyOn(component, 'showError');

        await component.storeDiff(fileEvent);
        expect(component.convertImage).not.toHaveBeenCalled();
        expect(component.verifyBMP).not.toHaveBeenCalled();
        expect(component.showError).toHaveBeenCalled();
        expect(component.originalImage).not.toBeDefined();
    });

    it('should return if the event target does not have files', async () => {
        const fileEvent = {
            target: {
                files: [],
            },
        };
        spyOn(component, 'convertImage').and.returnValue(Promise.resolve({ width: 640, height: 480 } as ImageBitmap));
        spyOn(component, 'verifyBMP').and.returnValue(Promise.resolve(true));
        spyOn(component, 'showError');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await component.storeDiff(fileEvent as any);
        expect(component.convertImage).not.toHaveBeenCalled();
        expect(component.verifyBMP).not.toHaveBeenCalled();
        expect(component.showError).toHaveBeenCalled();
        expect(component.originalImage).not.toBeDefined();
    });

    it('should store modifiable image', async () => {
        const input = document.createElement('input');
        input.type = 'file';
        const files = [new File(['test'], 'test.bmp', { type: 'image/bmp' })];
        Object.defineProperty(input, 'files', {
            value: files,
        });

        const fileEvent = {
            target: input as HTMLInputElement,
        };
        spyOn(component, 'verifyBMP').and.returnValue(Promise.resolve(true));
        spyOn(component, 'convertImage').and.returnValue(Promise.resolve({ width: 640, height: 480 } as ImageBitmap));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await component.storeDiff(fileEvent as any);
        expect(component.modifiableImage).toBeDefined();
        input.remove();
    });
    it('should not store original image if not bmp', async () => {
        const input = document.createElement('input');
        input.type = 'file';
        const files = [new File(['test'], 'test.jpeg', { type: 'image/jpeg' })];
        Object.defineProperty(input, 'files', {
            value: files,
        });

        const fileEvent = {
            target: input as HTMLInputElement,
        };

        spyOn(component, 'verifyBMP').and.returnValue(Promise.resolve(false));
        spyOn(component, 'convertImage').and.returnValue(Promise.resolve({ width: 640, height: 480 } as ImageBitmap));
        spyOn(component, 'showError');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await component.storeDiff(fileEvent as any);
        expect(component.verifyBMP).toHaveBeenCalled();
        expect(component.convertImage).not.toHaveBeenCalled();
        expect(component.showError).toHaveBeenCalled();
        expect(component.originalImage).toBeUndefined();
        input.remove();
    });
    it('should return if there is no selected file', async () => {
        const input = document.createElement('input');
        input.type = 'file';
        const files = [null];
        Object.defineProperty(input, 'files', {
            value: files,
        });

        const fileEvent = {
            target: input as HTMLInputElement,
        };
        spyOn(component, 'verifyBMP').and.returnValue(Promise.resolve(false));
        spyOn(component, 'convertImage').and.returnValue(Promise.resolve({ width: 640, height: 480 } as ImageBitmap));
        spyOn(component, 'showError');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await component.storeDiff(fileEvent as any);
        expect(component.convertImage).not.toHaveBeenCalled();
        expect(component.verifyBMP).not.toHaveBeenCalled();
        expect(component.showError).toHaveBeenCalled();
        expect(component.originalImage).toBeUndefined();
        input.remove();
    });
    it('should draw images on original and modifiable canvases if both images and contexts are present', async () => {
        component.originalImage = await createImageBitmap(canvas);
        component.modifiableImage = await createImageBitmap(canvas);

        const ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['drawImage']);
        const ctxModifiableStub = jasmine.createSpyObj('ctxModifiable', ['drawImage']);
        component.ctxOriginal = ctxOriginalStub;
        component.ctxModifiable = ctxModifiableStub;
        component.createDiffCanvas();
        expect(component.ctxOriginal?.drawImage).toHaveBeenCalled();
        expect(component.ctxModifiable?.drawImage).toHaveBeenCalled();
    });
    it('should not draw different canvases if images are missing', async () => {
        const ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['drawImage']);
        const ctxModifiableStub = jasmine.createSpyObj('ctxModifiable', ['drawImage']);
        component.ctxOriginal = ctxOriginalStub;
        component.ctxModifiable = ctxModifiableStub;
        component.createDiffCanvas();
        expect(component.ctxOriginal?.drawImage).not.toHaveBeenCalled();
        expect(component.ctxModifiable?.drawImage).not.toHaveBeenCalled();
    });
    it('should not draw different canvases if context are missing', async () => {
        component.originalImage = await createImageBitmap(canvas);
        component.modifiableImage = await createImageBitmap(canvas);

        const ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['drawImage']);
        const ctxModifiableStub = jasmine.createSpyObj('ctxModifiable', ['drawImage']);
        component.ctxOriginal = ctxOriginalStub;
        component.ctxModifiable = ctxModifiableStub;
        component.createDiffCanvas();
        expect(component.ctxOriginal?.drawImage).toHaveBeenCalled();
        expect(component.ctxModifiable?.drawImage).toHaveBeenCalled();
    });
    it('should not draw same canvases if images are missing', async () => {
        const ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['drawImage']);
        const ctxModifiableStub = jasmine.createSpyObj('ctxModifiable', ['drawImage']);
        component.ctxOriginal = ctxOriginalStub;
        component.ctxModifiable = ctxModifiableStub;
        component.createSameCanvas();
        expect(component.ctxOriginal?.drawImage).not.toHaveBeenCalled();
        expect(component.ctxModifiable?.drawImage).not.toHaveBeenCalled();
    });
    it('should not draw same canvases if context are missing', async () => {
        component.originalImage = await createImageBitmap(canvas);
        component.modifiableImage = await createImageBitmap(canvas);

        const ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['drawImage']);
        const ctxModifiableStub = jasmine.createSpyObj('ctxModifiable', ['drawImage']);
        component.ctxOriginal = ctxOriginalStub;
        component.ctxModifiable = ctxModifiableStub;
        component.createSameCanvas();
        expect(component.ctxOriginal?.drawImage).toHaveBeenCalled();
        expect(component.ctxModifiable?.drawImage).toHaveBeenCalled();
    });
    it('should draw images on original and modifiable canvases if both images and contexts are present', async () => {
        component.originalImage = await createImageBitmap(canvas);
        component.modifiableImage = await createImageBitmap(canvas);

        const ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['drawImage']);
        const ctxModifiableStub = jasmine.createSpyObj('ctxModifiable', ['drawImage']);
        component.ctxOriginal = ctxOriginalStub;
        component.ctxModifiable = ctxModifiableStub;
        component.createSameCanvas();
        expect(component.ctxOriginal?.drawImage).toHaveBeenCalled();
        expect(component.ctxModifiable?.drawImage).toHaveBeenCalled();
    });
    it('should delete original canvas', async () => {
        const ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['fillRect']);
        component.ctxOriginal = ctxOriginalStub;
        component.deleteOriginal();
        expect(component.ctxOriginal?.fillRect).toHaveBeenCalled();
    });
    it('should delete both canvases', async () => {
        const ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['fillRect']);
        const ctxModifiableStub = jasmine.createSpyObj('ctxModifiable', ['fillRect']);
        component.ctxOriginal = ctxOriginalStub;
        component.ctxModifiable = ctxModifiableStub;
        component.deleteBoth();
        expect(component.ctxOriginal?.fillRect).toHaveBeenCalled();
        expect(component.ctxModifiable?.fillRect).toHaveBeenCalled();
    });
    it('should be a BMP', async () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const blobHeader = new Uint8Array(54);
        blobHeader[0] = 66;
        blobHeader[1] = 77;
        blobHeader[28] = 24;
        const blob = new Blob([blobHeader]);
        const file = new File([blob], 'image.bmp', { type: 'image/bmp' });
        const result = await component.verifyBMP(file);

        expect(result).toBe(true);
    });
    it('should not be a BMP', async () => {
        const file = new File(['test'], 'test.jpeg', { type: 'image/jpeg' });
        spyOn(FileReader.prototype, 'readAsArrayBuffer').and.callThrough();

        const result = await component.verifyBMP(file);

        expect(FileReader.prototype.readAsArrayBuffer).toHaveBeenCalledWith(file);
        expect(result).toBe(false);
    });
    it('show difference ', () => {
        const diff = document.createElement('canvas');
        diff.id = 'diff';
        document.body.appendChild(diff);
        const coord: Coords[][] = [];
        spyOn(component, 'showDifference').and.callThrough();
        spyOn(component, 'createDifference').and.returnValue(canvas);
        differenceSpy.getDifference.and.returnValue({ count: 10, differences: coord });
        differenceSpy.isDifficult.and.returnValue(true);
        component.showDifference();

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.nbDiff).toEqual(10);
        expect(component.difficulty).toEqual('Difficile');
        diff.remove();
    });

    it('should call showSave if diffCount is between 3 and 9', async () => {
        const coord: Coords[][] = [];
        component.diffCanvas = canvas;
        differenceSpy.getDifference.and.returnValue({ count: 3, differences: coord });
        spyOn(component, 'createDifference');
        spyOn(component, 'showSave');

        component.inputName();

        expect(component.showSave).toHaveBeenCalled();
    });
    it('should call showError method if diffCount is less than 3', async () => {
        const coord: Coords[][] = [];
        component.diffCanvas = canvas;
        spyOn(component, 'createDifference');
        spyOn(component, 'showError');
        differenceSpy.getDifference.and.returnValue({ count: 2, differences: coord });
        component.inputName();
        expect(component.showError).toHaveBeenCalled();
    });
    it('should save game card', async () => {
        const coord: Coords[][] = [];
        spyOn(component, 'createDifference');
        spyOn(component, 'showError');
        differenceSpy.getDifference.and.returnValue({ count: 2, differences: coord });
        differenceSpy.isDifficult.and.returnValue(true);
        spyOn(component, 'verifyName').and.callFake((gameName: string, callback: (isVerified: boolean) => void) => {
            callback(true);
        });
        const response = new HttpResponse({
            body: 'test',
            status: 200,
            statusText: 'OK',
            headers: new HttpHeaders(),
        });

        communicationSpy.imagesPost.and.returnValue(of(response));
        component.saveGameCard();
        expect(component.showError).not.toHaveBeenCalled();
    });
    it('should not save game card', async () => {
        const coord: Coords[][] = [];
        spyOn(component, 'createDifference');
        spyOn(component, 'showError');
        differenceSpy.getDifference.and.returnValue({ count: 2, differences: coord });
        differenceSpy.isDifficult.and.returnValue(true);
        spyOn(component, 'verifyName').and.callFake((gameName: string, callback: (isVerified: boolean) => void) => {
            callback(false);
        });
        const response = new HttpResponse({
            body: 'test',
            status: 200,
            statusText: 'OK',
            headers: new HttpHeaders(),
        });

        communicationSpy.imagesPost.and.returnValue(of(response));
        component.saveGameCard();
        expect(component.showError).toHaveBeenCalled();
    });
    it('should call showErrorDifference method if diffCount is greater than 9', async () => {
        const coord: Coords[][] = [];
        component.diffCanvas = canvas;
        differenceSpy.getDifference.and.returnValue({ count: 10, differences: coord });
        spyOn(component, 'createDifference');
        spyOn(component, 'showError').and.callThrough();
        component.inputName();
        expect(component.showError).toHaveBeenCalled();
    });
    it('should create difference', async () => {
        const slider = document.createElement('input');
        slider.id = 'slider';
        slider.innerHTML = '5';
        document.body.appendChild(slider);
        const data = ctx?.getImageData(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
        drawingSpy.getLeftDrawing.and.returnValue(data);
        drawingSpy.getRightDrawing.and.returnValue(data);
        differenceSpy.findDifference.and.returnValue(canvas);
        const result = component.createDifference();
        expect(result).toBeDefined();
        slider.remove();
    });
    it('should not create difference', async () => {
        const slider = document.createElement('input');
        slider.id = 'slider';
        slider.innerHTML = '5';
        document.body.appendChild(slider);
        const data = ctx?.getImageData(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
        drawingSpy.getLeftDrawing.and.returnValue(undefined);
        drawingSpy.getRightDrawing.and.returnValue(data);
        differenceSpy.findDifference.and.returnValue(canvas);
        const result = component.createDifference();
        expect(result).not.toBeDefined();
        slider.remove();
    });
    it('should call the callback with true if the game name does not exist in the names list', () => {
        const gameName = 'new game';
        const callbackSpy = jasmine.createSpy('callback');
        communicationSpy.getGameNames.and.returnValue(of(['existing game 1', 'existing game 2']));

        component.verifyName(gameName, callbackSpy);

        expect(callbackSpy).toHaveBeenCalledWith(true);
    });
    it('should call the callback with false if the game name does exist in the names list', () => {
        const gameName = 'existing game 1';
        const callbackSpy = jasmine.createSpy('callback');
        communicationSpy.getGameNames.and.returnValue(of(['existing game 1', 'existing game 2']));

        component.verifyName(gameName, callbackSpy);

        expect(callbackSpy).toHaveBeenCalledWith(false);
    });
});
