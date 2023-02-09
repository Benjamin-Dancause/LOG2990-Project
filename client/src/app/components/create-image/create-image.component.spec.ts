import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreateImageComponent } from './create-image.component';

describe('CreateImageComponent', () => {
    let component: CreateImageComponent;
    let fixture: ComponentFixture<CreateImageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, BrowserAnimationsModule],
            declarations: [CreateImageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateImageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should show input different dialog', () => {
        spyOn(component.dialog, 'open').and.callThrough();
        component.showInputDifferent();
        expect(component.dialog.open).toHaveBeenCalledWith(component.inputDifferentTemplate, { width: '500px', height: '250px' });
        expect(component.canvasImages.length).toEqual(0);
    });
    it('should show input same dialog', () => {
        spyOn(component.dialog, 'open').and.callThrough();
        component.showInputSame();
        expect(component.dialog.open).toHaveBeenCalledWith(component.inputSameTemplate, { width: '450px', height: '200px' });
        expect(component.canvasImages.length).toEqual(0);
    });

    it('should show error dialog', () => {
        spyOn(component.dialog, 'open').and.callThrough();
        component.showError();
        expect(component.dialog.open).toHaveBeenCalledWith(component.errorTemplate, { width: '200px', height: '200px' });
    });
});
