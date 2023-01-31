import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-create-image',
    templateUrl: './create-image.component.html',
    styleUrls: ['./create-image.component.scss'],
})
export class CreateImageComponent implements OnInit {
    @ViewChild('inputDifferentTemplate', { static: true })
    inputDifferentTemplate: TemplateRef<unknown>;
    @ViewChild('inputSameTemplate', { static: true })
    inputSameTemplate: TemplateRef<unknown>;
    constructor(public dialog: MatDialog) {}

    ngOnInit(): void {}

    showInputDifferent(): void {
        this.dialog.open(this.inputDifferentTemplate, {
            width: '500px',
            height: '250px',
        });
    }
    showInputSame(): void {
        this.dialog.open(this.inputSameTemplate, {
            width: '450px',
            height: '200px',
        });
    }

    validateImage(fileEvent: Event): void {
        if (!(fileEvent.target instanceof HTMLInputElement) || !fileEvent.target.files) {
            console.error('No files detected');
            return;
        }

        const file = fileEvent.target.files[0];
        if (!file.name.endsWith('.bmp')) {
            console.error('File must be in BMP format');
        }
    }
}
export interface HTMLInputEvent extends Event {
    target: (HTMLInputElement & EventTarget) | null;
}
