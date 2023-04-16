import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HistoryDialogComponent } from './history-dialog.component';

describe('HistoryDialogComponent', () => {
    let component: HistoryDialogComponent;
    let fixture: ComponentFixture<HistoryDialogComponent>;
    let dialogRef: MatDialogRef<HistoryDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HistoryDialogComponent],
            providers: [
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: MatDialogRef, useValue: { close: () => {} } },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HistoryDialogComponent);
        component = fixture.componentInstance;
        dialogRef = TestBed.inject(MatDialogRef);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the correct time format', () => {
        const time = 1234;
        const expectedTime = '20:34';
        const result = component.displayTime(time);
        expect(result).toEqual(expectedTime);
    });

    it('should close the dialog when onResetClick is called', () => {
        spyOn(dialogRef, 'close');
        component.onResetClick();
        expect(dialogRef.close).toHaveBeenCalledWith('reset');
    });
});
