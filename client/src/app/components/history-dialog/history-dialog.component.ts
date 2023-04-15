import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { gameHistoryInfo } from '@common/game-interfaces';

@Component({
    selector: 'app-history-dialog', ///?
    templateUrl: './history-dialog.component.html',
    styleUrls: ['./history-dialog.component.scss'],
})
export class HistoryDialogComponent {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(public dialogRef: MatDialogRef<HistoryDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}
    
    onResetClick(): void {
        this.dialogRef.close('reset');
    }

    displayTime(time: number): string {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;
        const minutesString = minutes < 10 ? `0${minutes}` : `${minutes}`;
        return `${minutesString}:${secondsString}`;
    }

    displayMode(gameHistoryInfo: gameHistoryInfo) {
        if (gameHistoryInfo.isLimitedTime) {
            if (gameHistoryInfo.isSolo) {
                return 'Temps limité Solo';
            }
            return 'Temps limité coopératif';
        } else if (gameHistoryInfo.isSolo) {
            return 'Mode classique Solo';
        } else {
            return 'Mode classique 1v1';
        }
    }
}
