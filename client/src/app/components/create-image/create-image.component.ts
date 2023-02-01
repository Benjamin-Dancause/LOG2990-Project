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
        this.reader.readAsDataURL(fileEvent.target.files[0]);
        if (this.reader.result) {
            this.imageOriginal.src = this.reader.result.toString();
        }
        this.canvasImages.push(fileEvent.target.files[0]);
    }
    storeDiff(fileEvent: Event): void {
        if (!(fileEvent.target instanceof HTMLInputElement) || !fileEvent.target.files) {
            return;
        }
        if (this.reader.result) {
            this.imageModifiable.src = this.reader.result.toString();
        }
        this.canvasImages.push(fileEvent.target.files[0]);
    }

    async createDiffCanvas(): Promise<void> {
        if (await this.uploadService.validate(this.canvasImages)) {
            this.dialog.closeAll();
            console.log(this.imageOriginal.src.toString());
            this.imageOriginal.onload = () => {
                if (this.ctxOriginal) {
                    this.ctxOriginal.drawImage(this.imageOriginal, 0, 0, this.width, this.height);
                }
            };
        } else {
            this.dialog.closeAll();
            this.showError();
        }
    }
    async createSameCanvas(): Promise<void> {
        if (await this.uploadService.validate(this.canvasImages)) {
            this.dialog.closeAll();
            if (this.ctxModifiable) {
                this.ctxModifiable.drawImage(this.imageModifiable, 0, 0, this.width, this.height);
            }
        } else {
            this.dialog.closeAll();
            this.showError();
        }
    }

    drawImage(file: File): void {
        const canvas = this.canvasRef.nativeElement;
        const ctx = canvas.getContext('2d');
        const image = new Image();

        image.src = file.name;
        image.onload = () => {
            ctx.drawImage(image, 0, 0);
        };
    }
}
export interface HTMLInputEvent extends Event {
    target: (HTMLInputElement & EventTarget) | null;
}
