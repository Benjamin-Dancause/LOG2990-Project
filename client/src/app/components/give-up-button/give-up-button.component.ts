import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// eslint-disable-next-line no-restricted-imports
import { TextBoxComponent } from '@app/components/text-box/text-box.component';

@Component({
    selector: 'app-give-up-button',
    templateUrl: './give-up-button.component.html',
    styleUrls: ['./give-up-button.component.scss'],
})
export class GiveUpButtonComponent {
    @Input() text: string;
    @Input() color: string;
    @ViewChild('giveUpPromptTemplate', { static: true }) giveUpPromptTemplate: TemplateRef<unknown>;
    @ViewChild(TextBoxComponent) textBoxComponent: TextBoxComponent;

    constructor(public dialog: MatDialog) {}

    giveUpConfirmPrompt(): void {
        this.dialog
            .open(this.giveUpPromptTemplate, {
                width: '500px',
                height: '250px',
            })
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    this.textBoxComponent.addSystemMessage(`${this.textBoxComponent.userName} a quitté la partie.`);
                }
            });
    }
}
