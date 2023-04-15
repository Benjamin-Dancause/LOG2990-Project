import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-history-dialog', ///?
    templateUrl: './history-dialog.component.html',
    styleUrls: ['./history-dialog.component.scss'],
})
export class HistoryDialogComponent {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(public dialogRef: MatDialogRef<HistoryDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}
    
}
