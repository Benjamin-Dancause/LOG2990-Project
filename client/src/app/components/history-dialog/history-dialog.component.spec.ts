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

    it('should return the correct display mode for limited-time solo games', () => {
        const gameHistory = {
            gameTitle: 'My Game',
            winner: 'Myself',
            loser: 'nobody',
            surrender: false,
            time: { startTime: '2021-03-01T00:00:00.000Z', duration: 1234 },
            isSolo: true,
            isLimitedTime: true,
        };
        expect(component.displayMode(gameHistory)).toBe('Temps limité Solo');
    });

    it('should return the correct display mode for limited-time cooperative games', () => {
        const gameHistory = {
            gameTitle: 'My Game',
            winner: 'Myself',
            loser: 'nobody',
            surrender: false,
            time: { startTime: '2021-03-01T00:00:00.000Z', duration: 1234 },
            isSolo: false,
            isLimitedTime: true,
        };
        expect(component.displayMode(gameHistory)).toBe('Temps limité coopératif');
    });

    it('should return the correct display mode for classic solo games', () => {
        const gameHistory = {
            gameTitle: 'My Game',
            winner: 'Myself',
            loser: 'nobody',
            surrender: false,
            time: { startTime: '2021-03-01T00:00:00.000Z', duration: 1234 },
            isSolo: true,
            isLimitedTime: false,
        };
        expect(component.displayMode(gameHistory)).toBe('Mode classique Solo');
    });

    it('should return the correct display mode for classic 1v1 games', () => {
        const gameHistory = {
            gameTitle: 'My Game',
            winner: 'Myself',
            loser: 'nobody',
            surrender: false,
            time: { startTime: '2021-03-01T00:00:00.000Z', duration: 1234 },
            isSolo: false,
            isLimitedTime: false,
        };
        expect(component.displayMode(gameHistory)).toBe('Mode classique 1v1');
    });

    it('displayTime should return the correct time format', () => {
        const time = 61;
        const expectedTime = '01:01';
        const result = component.displayTime(time);
        expect(result).toEqual(expectedTime);
    });
});
