import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-give-up-button',
    templateUrl: './give-up-button.component.html',
    styleUrls: ['./give-up-button.component.scss'],
})
export class GiveUpButtonComponent {
    @Input() text: string;
    @Input() color: string;
    @ViewChild('giveUpPromptTemplate', { static: true })
    giveUpPromptTemplate: TemplateRef<unknown>;

    constructor(public dialog: MatDialog) {}

    giveUpConfirmPrompt(): void {
        this.dialog.open(this.giveUpPromptTemplate, {
            width: '500px',
            height: '250px',
        });
    }
}
