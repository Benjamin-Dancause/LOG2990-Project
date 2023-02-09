import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { CommunicationService } from '@app/services/communication.service';
import { DifferenceService } from '@app/services/difference.service';
import { CreateImageComponent } from './create-image.component';

describe('CreateImageComponent', () => {
    let component: CreateImageComponent;
    let fixture: ComponentFixture<CreateImageComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let differenceSpy: jasmine.SpyObj<DifferenceService>;
    let communicationSpy: jasmine.SpyObj<CommunicationService>;

    beforeEach(() => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        differenceSpy = jasmine.createSpyObj('DifferenceService', ['difference']);
        communicationSpy = jasmine.createSpyObj('CommunicationService', ['createImage']);

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
        expect(component.showError).not.toHaveBeenCalled();
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
        expect(component.showError).not.toHaveBeenCalled();
        expect(component.originalImage).not.toBeDefined();
    });
    /*
    it('should store original image', async () => {
        const file = new File(['test'], 'test.bmp', { type: 'image/bmp' });
        const fileEvent = {
            target: {
                files: [file],
            },
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

        await component.storeOriginal(fileEvent as any);
        expect(component.verifyBMP).toHaveBeenCalled();
        expect(component.convertImage).not.toHaveBeenCalled();
        expect(dialogSpy.closeAll).toHaveBeenCalled();
        expect(dialogSpy.open).toHaveBeenCalledWith(component.errorTemplate, { width: '250px', height: '250px' });
        expect(component.originalImage).toBeUndefined();
    });
    /*
    it('should return if there is no selected file', async () => {
        inputElement.files = [null];
        fileEvent.target = inputEvent;
        await component.storeOriginal(fileEvent);
        expect(component.convertImage).not.toHaveBeenCalled();
        expect(component.verifyBMP).not.toHaveBeenCalled();
        expect(component.dialog.closeAll).not.toHaveBeenCalled();
        expect(component.showError).not.toHaveBeenCalled();
        expect(component.originalImage).toBeUndefined();
    });
    it('should store original image when file is a BMP image with the correct dimensions', async () => {
        const fileEvent = {
            target: {
                files: [new Blob([new ArrayBuffer(10)], { type: 'image/bmp' })],
            },
        };
        const spyOnVerifyBMP = jest.spyOn(component, 'verifyBMP').mockResolvedValue(true);
        const spyOnConvertImage = jest.spyOn(component, 'convertImage').mockResolvedValue({
            width: component.width,
            height: component.height,
        });
        const spyOnShowError = jest.spyOn(component, 'showError');
        const spyOnDialogCloseAll = jest.spyOn(component.dialog, 'closeAll');

        await component.storeOriginal(fileEvent as Event);

        expect(spyOnVerifyBMP).toHaveBeenCalledWith(fileEvent.target.files[0]);
        expect(spyOnConvertImage).toHaveBeenCalledWith(fileEvent.target.files[0]);
        expect(spyOnShowError).not.toHaveBeenCalled();
        expect(spyOnDialogCloseAll).not.toHaveBeenCalled();
        expect(component.originalImage).toEqual({
            width: component.width,
            height: component.height,
        });
    });*/
});
