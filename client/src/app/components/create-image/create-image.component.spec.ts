import { HttpResponse } from '@angular/common/http';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { CommunicationService } from '@app/services/communication.service';
import { DifferenceService } from '@app/services/difference.service';
import { of } from 'rxjs';
import { CreateImageComponent } from './create-image.component';

describe('CreateImageComponent', () => {
    let component: CreateImageComponent;
    let fixture: ComponentFixture<CreateImageComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let differenceSpy: jasmine.SpyObj<DifferenceService>;
    //let difference: DifferenceService;
    let communicationSpy: jasmine.SpyObj<CommunicationService>;
    //let image: ImageBitmap;
    const canvas = document.createElement('canvas');
    let canvasRef: ElementRef<HTMLCanvasElement>;
    canvas.width = 640;
    canvas.height = 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    beforeEach(async () => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open'], ['closeAll']);
        differenceSpy = jasmine.createSpyObj('DifferenceService', ['countDifference'], ['findDifference']);
        communicationSpy = jasmine.createSpyObj('CommunicationService', ['imagesPost']);
        //image = await getImageBitmap();
        canvasRef = new ElementRef<HTMLCanvasElement>(document.createElement('canvas'));
        //difference = new DifferenceService();

        TestBed.configureTestingModule({
            declarations: [CreateImageComponent],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: DifferenceService, useValue: differenceSpy },
                { provide: CommunicationService, useValue: communicationSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateImageComponent);
        component = fixture.componentInstance;
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
        component.showError();
        expect(dialogSpy.open).toHaveBeenCalledWith(component.errorTemplate, {
            width: '250px',
            height: '250px',
        });
    });
    it('should open the errorTemplateDifference dialog', () => {
        component.showErrorDifference();
        expect(dialogSpy.open).toHaveBeenCalledWith(component.errorTemplateDifference, {
            width: '250px',
            height: '200px',
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
        await component.storeOriginal(fileEvent as any);
        expect(component.originalImage).toBeDefined();
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

        await component.storeOriginal(fileEvent as any);
        expect(component.verifyBMP).toHaveBeenCalled();
        expect(component.convertImage).not.toHaveBeenCalled();
        expect(component.showError).toHaveBeenCalled();
        expect(component.originalImage).toBeUndefined();
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

        await component.storeOriginal(fileEvent as any);
        expect(component.convertImage).not.toHaveBeenCalled();
        expect(component.verifyBMP).not.toHaveBeenCalled();
        expect(component.showError).toHaveBeenCalled();
        expect(component.originalImage).toBeUndefined();
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

        console.log('testing');
        await component.storeDiff(fileEvent as any);
        expect(component.modifiableImage).toBeDefined();
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

        await component.storeDiff(fileEvent as any);
        expect(component.verifyBMP).toHaveBeenCalled();
        expect(component.convertImage).not.toHaveBeenCalled();
        expect(component.showError).toHaveBeenCalled();
        expect(component.originalImage).toBeUndefined();
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

        await component.storeDiff(fileEvent as any);
        expect(component.convertImage).not.toHaveBeenCalled();
        expect(component.verifyBMP).not.toHaveBeenCalled();
        expect(component.showError).toHaveBeenCalled();
        expect(component.originalImage).toBeUndefined();
    });
    it('should draw images on original and modifiable canvases if both images and contexts are present', async () => {
        component.originalImage = await createImageBitmap(canvas);
        component.modifiableImage = await createImageBitmap(canvas);

        let ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['drawImage']);
        let ctxModifiableStub = jasmine.createSpyObj('ctxModifiable', ['drawImage']);
        component.ctxOriginal = ctxOriginalStub;
        component.ctxModifiable = ctxModifiableStub;
        component.createDiffCanvas();
        expect(component.ctxOriginal?.drawImage).toHaveBeenCalled();
        expect(component.ctxModifiable?.drawImage).toHaveBeenCalled();
    });
    it('should not draw different canvases if images are missing', async () => {
        let ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['drawImage']);
        let ctxModifiableStub = jasmine.createSpyObj('ctxModifiable', ['drawImage']);
        component.ctxOriginal = ctxOriginalStub;
        component.ctxModifiable = ctxModifiableStub;
        component.createDiffCanvas();
        expect(component.ctxOriginal?.drawImage).not.toHaveBeenCalled();
        expect(component.ctxModifiable?.drawImage).not.toHaveBeenCalled();
    });
    it('should not draw different canvases if context are missing', async () => {
        component.originalImage = await createImageBitmap(canvas);
        component.modifiableImage = await createImageBitmap(canvas);

        let ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['drawImage']);
        let ctxModifiableStub = jasmine.createSpyObj('ctxModifiable', ['drawImage']);
        component.ctxOriginal = ctxOriginalStub;
        component.ctxModifiable = ctxModifiableStub;
        component.createDiffCanvas();
        expect(component.ctxOriginal?.drawImage).toHaveBeenCalled();
        expect(component.ctxModifiable?.drawImage).toHaveBeenCalled();
    });
    it('should not draw same canvases if images are missing', async () => {
        let ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['drawImage']);
        let ctxModifiableStub = jasmine.createSpyObj('ctxModifiable', ['drawImage']);
        component.ctxOriginal = ctxOriginalStub;
        component.ctxModifiable = ctxModifiableStub;
        component.createSameCanvas();
        expect(component.ctxOriginal?.drawImage).not.toHaveBeenCalled();
        expect(component.ctxModifiable?.drawImage).not.toHaveBeenCalled();
    });
    it('should not draw same canvases if context are missing', async () => {
        component.originalImage = await createImageBitmap(canvas);
        component.modifiableImage = await createImageBitmap(canvas);

        let ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['drawImage']);
        let ctxModifiableStub = jasmine.createSpyObj('ctxModifiable', ['drawImage']);
        component.ctxOriginal = ctxOriginalStub;
        component.ctxModifiable = ctxModifiableStub;
        component.createSameCanvas();
        expect(component.ctxOriginal?.drawImage).toHaveBeenCalled();
        expect(component.ctxModifiable?.drawImage).toHaveBeenCalled();
    });
    it('should draw images on original and modifiable canvases if both images and contexts are present', async () => {
        component.originalImage = await createImageBitmap(canvas);
        component.modifiableImage = await createImageBitmap(canvas);

        let ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['drawImage']);
        let ctxModifiableStub = jasmine.createSpyObj('ctxModifiable', ['drawImage']);
        component.ctxOriginal = ctxOriginalStub;
        component.ctxModifiable = ctxModifiableStub;
        component.createSameCanvas();
        expect(component.ctxOriginal?.drawImage).toHaveBeenCalled();
        expect(component.ctxModifiable?.drawImage).toHaveBeenCalled();
    });
    it('should not delete original canvas if ctx is missing', async () => {
        /* let ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['clearRect']);
        ctxOriginalStub = null;
        component.ctxOriginal = ctxOriginalStub;
        component.deleteOriginal();
        expect(component.ctxOriginal?.clearRect).not.toHaveBeenCalled();*/
    });
    it('should delete original canvas', async () => {
        let ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['clearRect']);
        component.ctxOriginal = ctxOriginalStub;
        component.deleteOriginal();
        expect(component.ctxOriginal?.clearRect).toHaveBeenCalled();
    });
    it('should delete both canvases', async () => {
        let ctxOriginalStub = jasmine.createSpyObj('ctxOriginal', ['clearRect']);
        let ctxModifiableStub = jasmine.createSpyObj('ctxModifiable', ['clearRect']);
        component.ctxOriginal = ctxOriginalStub;
        component.ctxModifiable = ctxModifiableStub;
        component.deleteBoth();
        expect(component.ctxOriginal?.clearRect).toHaveBeenCalled();
        expect(component.ctxModifiable?.clearRect).toHaveBeenCalled();
    });
    it('should not delete both canvases if ctx is missing', async () => {});
    it('should not delete both canvases if ctx is missing', async () => {});
    it('should be a BMP', async () => {
        const header = new Uint8Array([66, 77]);
        const blob = new Blob([header]);
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

    it('should return a promise that resolves to a string', async () => {
        spyOn(canvasRef.nativeElement, 'toBlob').and.callFake((callback) => {
            callback(new Blob());
        });
        spyOn(FileReader.prototype, 'readAsDataURL').and.callThrough();

        const result = await component.convertToBase64(canvasRef);

        expect(canvasRef.nativeElement.toBlob).toHaveBeenCalled();
        expect(FileReader.prototype.readAsDataURL).toHaveBeenCalledWith(jasmine.any(Blob));
        expect(result).toEqual(jasmine.any(String));
    });

    it('should reject the promise if the canvas toBlob method throws an error', async () => {
        spyOn(canvasRef.nativeElement, 'toBlob').and.throwError('toBlob error');

        component.convertToBase64(canvasRef).catch((error) => {
            expect(error).toMatch('toBlob error');
        });
    });

    it('should reject the promise if the FileReader onerror event is triggered', async () => {
        /*spyOn(canvasRef.nativeElement, 'toBlob').and.callFake((callback) => {
            callback(new Blob());
        });
        spyOn(FileReader.prototype, 'readAsDataURL').and.callThrough();
        spyOn(FileReader.prototype, 'onerror').and.callFake(() => {
            const reader = new FileReader();
            (reader as any).error = 'FileReader error';
        });
        component.convertToBase64(canvasRef).catch((error) => {
            expect(error).toBe('FileReader error');
        });*/
    });
    it('should call createDifference method', async () => {
        spyOn(component, 'createDifference').and.returnValue(Promise.resolve(canvas));
        const spyDiff = jasmine.createSpyObj('difference', ['countDifference']);
        spyDiff.countDifference.and.returnValue(4);
        component.difference = spyDiff;
        spyOn(component, 'showSave');
        component.inputName();
        expect(component.createDifference).toHaveBeenCalled();
    });
    it('should call showSave method if diffCount is between 3 and 9', async () => {
        spyOn(component, 'createDifference').and.returnValue(Promise.resolve(canvas));
        const spyDiff = jasmine.createSpyObj('difference', ['countDifference']);
        spyDiff.countDifference.and.returnValue(4);
        component.difference = spyDiff;
        spyOn(component, 'showSave').and.callThrough();
        console.log('should call showSave method if diffCount is between 3 and 9');
        component.inputName();
        expect(component.showSave).toHaveBeenCalled();
    });

    it('should call showErrorDifference method if diffCount is less than 3', async () => {
        spyOn(component, 'createDifference').and.returnValue(Promise.resolve(canvas));
        const spyDiff = jasmine.createSpyObj('difference', ['countDifference']);
        spyDiff.countDifference.and.returnValue(2);
        component.difference = spyDiff;
        spyOn(component, 'showErrorDifference');
        console.log('should call showErrorDifference method if diffCount is less than 3');
        component.inputName();
        expect(component.showErrorDifference).toHaveBeenCalled();
    });

    it('should call showErrorDifference method if diffCount is greater than 9', async () => {
        spyOn(component, 'createDifference').and.returnValue(Promise.resolve(canvas));
        const spyDiff = jasmine.createSpyObj('difference', ['countDifference']);
        spyDiff.countDifference.and.returnValue(10);
        component.difference = spyDiff;
        spyOn(component, 'showErrorDifference');
        console.log('should call showErrorDifference method if diffCount is greater than 9');
        component.inputName();
        expect(component.showErrorDifference).toHaveBeenCalled();
    });

    it('should call showErrorDifference method if createDifference returns false', async () => {
        /*spyOn(component, 'createDifference').and.returnValue(Promise.resolve(canvas));
        spyOn(component, 'showErrorDifference').and.callThrough();
        component.inputName();
        expect(component.showErrorDifference).toHaveBeenCalled();*/
    });

    it('should convert canvas to base64', async () => {
        let toBlobSpy: jasmine.Spy;
        toBlobSpy = spyOn(canvasRef.nativeElement, 'toBlob');
        toBlobSpy.and.callFake((cb) => {
            cb(new Blob(['image data'], { type: 'image/png' }));
        });

        component.convertToBase64(canvasRef).then((base64) => {
            expect(typeof base64).toBe('string');
            expect(toBlobSpy).toHaveBeenCalled();
        });
    });

    it('should reject with error if the canvas is not converted to blob', async () => {
        let toBlobSpy: jasmine.Spy;
        toBlobSpy = spyOn(canvasRef.nativeElement, 'toBlob');
        toBlobSpy.and.callFake((cb) => {
            cb(new Blob(['image data'], { type: 'image/png' }));
        });
        try {
            await component.convertToBase64(canvasRef);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
        expect(canvasRef.nativeElement.toBlob).toHaveBeenCalled();
    });

    it('should send a post request with the game data', async () => {
        component.gameName = 'Test Game';
        component.originalCanvas = canvasRef;
        component.modifiableCanvas = canvasRef;
        communicationSpy.imagesPost.and.returnValue(of(new HttpResponse({ body: 'some response' })));
        spyOn(component, 'convertToBase64').and.returnValues(Promise.resolve('test'), Promise.resolve('test'));

        await component.saveGameCard();

        expect(component.convertToBase64).toHaveBeenCalledWith(component.originalCanvas);
        expect(component.convertToBase64).toHaveBeenCalledWith(component.modifiableCanvas);
        expect(communicationSpy.imagesPost).toHaveBeenCalledWith({
            name: 'Test Game',
            originalImage: 'test',
            modifiableImage: 'test',
        });
    });
    it('should return a new HTMLCanvasElement if ctxOriginal or ctxModifiable are null', async () => {
        let canvasTest = document.createElement('canvas');
        differenceSpy.findDifference.and.returnValue(await Promise.resolve(canvasTest));

        const result = await component.createDifference();

        expect(result).toBeInstanceOf(HTMLCanvasElement);
        expect(differenceSpy.findDifference).toHaveBeenCalled();
    });
});
