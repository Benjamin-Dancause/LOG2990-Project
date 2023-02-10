import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommunicationService } from '@app/services/communication.service';
import { DifferenceService } from '@app/services/difference.service';

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;
const BMP_MIN = 66;
const BMP_MAX = 77;
const DIFFCOUNT_MAX = 9;

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
    @ViewChild('errorTemplateDiff', { static: true })
    errorTemplateDifference: TemplateRef<unknown>;
    @ViewChild('originalCanvas', { static: true })
    originalCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiableCanvas', { static: true })
    modifiableCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('negativeTemplate', { static: true })
    negativeTemplate: TemplateRef<unknown>;
    @ViewChild('saveTemplate', { static: true })
    saveTemplate: TemplateRef<unknown>;
    reader = new FileReader();
    ctxOriginal: CanvasRenderingContext2D | null;
    ctxModifiable: CanvasRenderingContext2D | null;
    canvasImages: File[] = [];
    width: number = SCREEN_WIDTH;
    height: number = SCREEN_HEIGHT;
    valid: boolean = true;
    originalImage: ImageBitmap;
    modifiableImage: ImageBitmap;
    gameName: string = '';

    constructor(
        public dialog: MatDialog,
        // private uploadService: UploadService,
        protected difference: DifferenceService,
        private communication: CommunicationService,
    ) {}

    onFileSelected() {
        throw new Error('Method not implemented.');
    }

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
            width: '250px',
            height: '250px',
        });
    }
    showErrorDifference(): void {
        this.dialog.open(this.errorTemplateDifference, {
            width: '250px',
            height: '200px',
        });
    }
    showSave(): void {
        this.dialog.open(this.saveTemplate, {
            width: '250px',
            height: '200px',
        });
    }
    async storeOriginal(fileEvent: Event): Promise<void> {
        if (!(fileEvent.target instanceof HTMLInputElement) || !fileEvent.target.files) {
            return;
        }
        const selectedFile = fileEvent.target.files[0];
        if (!selectedFile) {
            return;
        }
        if (await this.verifyBMP(selectedFile)) {
            const image = await this.convertImage(selectedFile);
            if (image.width === this.width || image.height === this.height) {
                this.originalImage = image;
            } else {
                this.dialog.closeAll();
                this.showError();
            }
        } else {
            this.dialog.closeAll();
            this.showError();
        }
    }
    async storeDiff(fileEvent: Event): Promise<void> {
        if (!(fileEvent.target instanceof HTMLInputElement) || !fileEvent.target.files) {
            return;
        }
        const selectedFile = fileEvent.target.files[0];
        if (!selectedFile) {
            return;
        }
        if (await this.verifyBMP(selectedFile)) {
            const image = await this.convertImage(selectedFile);
            if (image.width === this.width || image.height === this.height) {
                this.modifiableImage = image;
            } else {
                this.dialog.closeAll();
                this.showError();
            }
        } else {
            this.dialog.closeAll();
            this.showError();
        }
    }
    createDiffCanvas(): void {
        if (this.originalImage && this.modifiableImage) {
            if (this.ctxOriginal && this.ctxModifiable) {
                this.ctxOriginal.drawImage(this.originalImage, 0, 0, this.width, this.height);
                this.ctxModifiable.drawImage(this.modifiableImage, 0, 0, this.width, this.height);
            }
        }
        this.dialog.closeAll();
    }
    async createSameCanvas(): Promise<void> {
        if (this.originalImage) {
            if (this.ctxOriginal && this.ctxModifiable) {
                this.ctxOriginal.drawImage(this.originalImage, 0, 0, this.width, this.height);
                this.ctxModifiable.drawImage(this.originalImage, 0, 0, this.width, this.height);
            }
        }
        this.dialog.closeAll();
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
    deleteBoth(): void {
        this.deleteOriginal();
        this.deleteModifiable();
    }
    async createDifference(): Promise<HTMLCanvasElement> {
        if (this.ctxOriginal && this.ctxModifiable) {
            const diff = this.difference.findDifference(this.ctxOriginal, this.ctxModifiable, 3);
            return diff;
        }
        return new HTMLCanvasElement();
    }

    showDifference(): void {
        this.createDifference().then((diff) => {
            this.dialog.open(this.negativeTemplate, {
                width: '700px',
                height: '620px',
            });
            const negDiv = document.getElementById('neg') as HTMLDivElement;
            negDiv.appendChild(diff);
            const nbdiff = document.createElement('p');
            nbdiff.innerHTML = "Nombre d'erreur : ".concat(this.difference.countDifference(diff).toString());
            negDiv.appendChild(nbdiff);
            const dificulty = document.createElement('p');
            dificulty.innerHTML = 'Difficulté : '.concat(this.difference.isDifficult(diff) ? 'Difficile' : 'Facile');
            negDiv.appendChild(dificulty);
        });
    }
    async verifyBMP(file: File): Promise<boolean> {
        const bmp: number[] = [BMP_MIN, BMP_MAX];
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const imageData = new Uint8Array(reader.result as ArrayBuffer);
                resolve(imageData[0] === bmp[0] && imageData[1] === bmp[1]);
            };
            reader.readAsArrayBuffer(file);
        });
    }
    async convertImage(file: File): Promise<ImageBitmap> {
        return await createImageBitmap(file);
    }

    inputName(): void {
        this.createDifference().then((diff) => {
            if (diff) {
                const diffCount = this.difference.countDifference(diff);
                if (diffCount >= 3 && diffCount <= DIFFCOUNT_MAX) {
                    this.showSave();
                } else {
                    this.showErrorDifference();
                }
            } else {
                this.showErrorDifference();
            }
        });
    }
    async saveGameCard(): Promise<void> {
        this.gameName = `${this.gameName}`;

        const originalImageBlob = await this.convertImageToBlob(this.originalCanvas);
        const modifiableImageBlob = await this.convertImageToBlob(this.modifiableCanvas);

        const formData = new FormData();
        formData.append('name', this.gameName);
        formData.append('originalImage', originalImageBlob, `${this.gameName}_originalImage.bmp`);
        formData.append('modifiableImage', modifiableImageBlob, `${this.gameName}_modifiableImage.bmp`);

        this.communication.postGameCard(formData);
    }

    async convertImageToBlob(canvas: ElementRef<HTMLCanvasElement>): Promise<Blob> {
        return new Promise((resolve, reject) => {
            canvas.nativeElement.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Failed to convert canvas to Blob'));
                    return;
                }

                resolve(new Blob([blob], { type: 'image/bmp' }));
            });
        });
    }
}
export interface HTMLInputEvent extends Event {
    target: (HTMLInputElement & EventTarget) | null;
}
