/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameConfigService } from '@app/services/game-config/game-config.service';

@Component({
    selector: 'app-settings-button',
    templateUrl: './settings-button.component.html',
    styleUrls: ['./settings-button.component.scss'],
})
export class SettingsButtonComponent {
    @ViewChild('settingsPopupTemplate', { static: true })
    settingsPopupTemplate: TemplateRef<any>;
    countdownTime: number;
    penaltyTime: number;
    timeGained: number;

    constructor(public dialog: MatDialog, private gameConfigService: GameConfigService) {}

    openSettings(): void {
        this.gameConfigService.getCountdownTime().subscribe((countdownTime) => (this.countdownTime = countdownTime));
        this.gameConfigService.getPenaltyTime().subscribe((penaltyTime) => (this.penaltyTime = penaltyTime));
        this.gameConfigService.getTimeGained().subscribe((timeGained) => (this.timeGained = timeGained));
        this.dialog.open(this.settingsPopupTemplate, {
            width: '500px',
        });
    }

    close(): void {
        // Close the dialog without saving changes
        this.dialog.closeAll();
    }

    save() {
        this.gameConfigService.setCountdownTime(this.countdownTime).subscribe();
        this.gameConfigService.setPenaltyTime(this.penaltyTime).subscribe();
        this.gameConfigService.setTimeGained(this.timeGained).subscribe();
        this.dialog.closeAll();
    }

    resetValues() {
        this.countdownTime = 30;
        this.penaltyTime = 5;
        this.timeGained = 5;
    }
}
