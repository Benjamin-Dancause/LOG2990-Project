import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HistoryDialogComponent } from './history-dialog.component';

describe('ConfirmationDialogComponent', () => {
    let component: HistoryDialogComponent;
    let fixture: ComponentFixture<HistoryDialogComponent>;
    // let dialogRef: MatDialogRef<HistoryDialogComponent>;

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
        // dialogRef = TestBed.inject(MatDialogRef);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
