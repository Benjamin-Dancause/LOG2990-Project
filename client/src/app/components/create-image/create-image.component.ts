import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UploadService } from '@app/services/upload.service';

@Component({
    selector: 'app-create-image',
    templateUrl: './create-image.component.html',
    styleUrls: ['./create-image.component.scss'],
})
export class CreateImageComponent implements OnInit {
    @ViewChild('myCanvas') canvasRef: ElementRef;
    @ViewChild('inputDifferentTemplate', { static: true })
    inputDifferentTemplate: TemplateRef<unknown>;
    @ViewChild('inputSameTemplate', { static: true })
    inputSameTemplate: TemplateRef<unknown>;
    @ViewChild('errorTemplate', { static: true })
    errorTemplate: TemplateRef<unknown>;
    @ViewChild('originalCanvas', { static: true })
    originalCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiableCanvas', { static: true })
    modifiableCanvas: ElementRef<HTMLCanvasElement>;

    reader = new FileReader();
    ctxOriginal: CanvasRenderingContext2D | null;
    ctxModifiable: CanvasRenderingContext2D | null;
    canvasImages: File[] = [];
    imageOriginal = new Image();
    imageModifiable = new Image();
    width: number = 640;
    height: number = 480;

    constructor(public dialog: MatDialog, private uploadService: UploadService) {}

    ngOnInit(): void {
        this.ctxOriginal = this.originalCanvas.nativeElement.getContext('2d');
        this.ctxModifiable = this.modifiableCanvas.nativeElement.getContext('2d');
    }

    showInputDifferent(): void {
        this.canvasImages.length = 0;
        this.dialog.open(this.inputDifferentTemplate, {
            width: '500px',
            height: '250px',
        });
    }
    showInputSame(): void {
        this.canvasImages.length = 0;
        this.dialog.open(this.inputSameTemplate, {
            width: '450px',
            height: '200px',
        });
    }
    showError(): void {
        this.dialog.open(this.errorTemplate, {
            width: '200px',
            height: '200px',
        });
    }
    storeOriginal(fileEvent: Event): void {
        if (!(fileEvent.target instanceof HTMLInputElement) || !fileEvent.target.files) {
            return;
        }
        const selectedFile = fileEvent.target.files[0];
        if (!selectedFile) {
            return;
        }
        this.reader.onload = () => {
            if (this.reader.result) {
                this.imageOriginal.src = this.reader.result.toString();
                this.canvasImages.push(selectedFile);
            }
        };
        this.reader.readAsDataURL(selectedFile);
    }
    storeDiff(fileEvent: Event): void {
        if (!(fileEvent.target instanceof HTMLInputElement) || !fileEvent.target.files) {
            return;
        }
        const selectedFile = fileEvent.target.files[0];
        if (!selectedFile) {
            return;
        }
        this.reader.onload = () => {
            if (this.reader.result) {
                this.imageModifiable.src = this.reader.result.toString();
                this.canvasImages.push(selectedFile);
            }
        };
        this.reader.readAsDataURL(selectedFile);
    }

    async createDiffCanvas(): Promise<void> {
        if (await this.uploadService.validate(this.canvasImages)) {
            this.dialog.closeAll();
            if (this.imageOriginal.complete) {
                if (this.ctxOriginal) {
                    this.ctxOriginal.drawImage(this.imageOriginal, 0, 0, this.width, this.height);
                    console.log('test');
                }
            } else {
                this.imageOriginal.onload = () => {
                    console.log(this.ctxOriginal + 'here');
                    if (this.ctxOriginal) {
                        this.ctxOriginal.drawImage(this.imageOriginal, 0, 0, this.width, this.height);
                    }
                };
            }
            if (this.imageModifiable.complete) {
                if (this.ctxModifiable) {
                    this.ctxModifiable.drawImage(this.imageModifiable, 0, 0, this.width, this.height);
                    console.log('test');
                }
            } else {
                this.imageModifiable.onload = () => {
                    if (this.ctxModifiable) {
                        this.ctxModifiable.drawImage(this.imageModifiable, 0, 0, this.width, this.height);
                    }
                };
            }
        } else {
            this.dialog.closeAll();
            this.showError();
        }
    }
    async createSameCanvas(): Promise<void> {
        if (await this.uploadService.validate(this.canvasImages)) {
            this.dialog.closeAll();
            if (this.ctxOriginal) {
                this.ctxOriginal.drawImage(this.imageOriginal, 0, 0, this.width, this.height);
            }
            if (this.ctxModifiable) {
                this.ctxModifiable.drawImage(this.imageOriginal, 0, 0, this.width, this.height);
            }
        } else {
            this.dialog.closeAll();
            this.showError();
        }
    }
    deleteOriginal(): void {
        if (this.ctxOriginal) {
            this.ctxOriginal.clearRect(0, 0, this.width, this.height);
        }
    }
    deleteModifiable(): void {
        if (this.ctxModifiable) {
            this.ctxModifiable.clearRect(0, 0, this.width, this.height);
        }
    }
}
export interface HTMLInputEvent extends Event {
    target: (HTMLInputElement & EventTarget) | null;
}
