import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DifferenceService } from '@app/services/difference.service';

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
    @ViewChild('negativeTemplate', { static: true })
    negativeTemplate: TemplateRef<unknown>;
    reader = new FileReader();
    ctxOriginal: CanvasRenderingContext2D | null;
    ctxModifiable: CanvasRenderingContext2D | null;
    canvasImages: File[] = [];
    width: number = 640;
    height: number = 480;
    valid: boolean = true;

    constructor(
        public dialog: MatDialog,
        //private uploadService: UploadService,
        protected difference: DifferenceService, //private communication: CommunicationService,
    ) {}

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
            if (image.width == this.width || image.height == this.height) {
                console.log('heheXD');
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
            if (image.width == this.width || image.height == this.height) {
                console.log('heheXD');
            } else {
                this.dialog.closeAll();
                this.showError();
            }
        }
    }

    async createDiffCanvas(): Promise<void> {
        /*
        if (await this.uploadService.validate(this.canvasImages)) {
            this.dialog.closeAll();
            if (this.imageOriginal.complete) {
                if (this.ctxOriginal) {
                    this.ctxOriginal.drawImage(this.imageOriginal, 0, 0, this.width, this.height);
                }
            } else {
                this.imageOriginal.onload = () => {
                    if (this.ctxOriginal) {
                        this.ctxOriginal.drawImage(this.imageOriginal, 0, 0, this.width, this.height);
                    }
                };
            }
            if (this.imageModifiable.complete) {
                if (this.ctxModifiable) {
                    this.ctxModifiable.drawImage(this.imageModifiable, 0, 0, this.width, this.height);
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
        }*/
    }
    async createSameCanvas(): Promise<void> {
        /*
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
        }*/
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
    async createDifference(): Promise<HTMLCanvasElement> {
        if (this.ctxOriginal && this.ctxModifiable) {
            const diff = this.difference.findDifference(this.ctxOriginal, this.ctxModifiable, 3);
            return diff;
        }
        return new HTMLCanvasElement();
    }

    showDifference(): void {
        this.createDifference().then((diff) => {
            if (diff) {
                this.dialog.open(this.negativeTemplate, {
                    width: '700px',
                    height: '620px',
                });
                document.getElementById('neg')?.appendChild(diff);
                const nbdiff = document.createElement('p');
                nbdiff.innerHTML = "Nombre d'erreur : ".concat(this.difference.countDifference(diff).toString());
                document.getElementById('neg')?.appendChild(nbdiff);
            }
        });
    }
    async validateDim(files: File[]): Promise<boolean> {
        this.valid = true;
        const promises: Array<Promise<void>> = [];
        for (const file of files) {
            const reader = new FileReader();
            const promise = new Promise<void>((resolve) => {
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const img = new Image();
                    img.src = reader.result as string;
                    let width: number = 0;
                    let height: number = 0;
                    img.onload = () => {
                        height = img.naturalHeight;
                        width = img.naturalWidth;
                        if (height != this.height || width != this.width) {
                            this.valid = false;
                        }
                        resolve();
                    };
                };
            });
            promises.push(promise);
        }
        return Promise.all(promises).then(() => {
            return this.valid;
        });
    }
    async verifyBMP(file: File): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function () {
                const imageData = new Uint8Array(reader.result as ArrayBuffer);
                resolve(imageData[0] === 66 && imageData[1] === 77);
            };
            reader.readAsArrayBuffer(file);
        });
    }
    async convertImage(file: File): Promise<ImageBitmap> {
        return await createImageBitmap(file);
    }
}
export interface HTMLInputEvent extends Event {
    target: (HTMLInputElement & EventTarget) | null;
}
