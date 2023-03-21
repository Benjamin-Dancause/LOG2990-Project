import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
    let component: ConfirmationDialogComponent;
    let fixture: ComponentFixture<ConfirmationDialogComponent>;
    let dialogRef: MatDialogRef<ConfirmationDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfirmationDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: { close: () => {} } },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmationDialogComponent);
        component = fixture.componentInstance;
        dialogRef = TestBed.inject(MatDialogRef);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close dialog with "no" value when clicking "No" button', () => {
        spyOn(dialogRef, 'close');
        component.onNoClick();
        expect(dialogRef.close).toHaveBeenCalledWith('no');
    });

    it('should close dialog with "yes" value when clicking "Yes" button', () => {
        spyOn(dialogRef, 'close');
        component.onYesClick();
        expect(dialogRef.close).toHaveBeenCalledWith('yes');
    });
});
