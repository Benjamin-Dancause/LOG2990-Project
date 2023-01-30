import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-settings-button',
    templateUrl: './settings-button.component.html',
    styleUrls: ['./settings-button.component.scss'],
})
export class SettingsButtonComponent {
    @ViewChild('settingsPopupTemplate', { static: true })
    settingsPopupTemplate: TemplateRef<unknown>;
    countdownTime: 30;
    penaltyTime: 5;
    timeGained: 5;
    constructor(public dialog: MatDialog) {}

    openSettings(): void {
        this.dialog.open(this.settingsPopupTemplate, {
            width: '500px',
            data: {
                countdownTime: this.countdownTime,
                penaltyTime: this.penaltyTime,
                timeGained: this.timeGained,
            },
        });
    }
}
