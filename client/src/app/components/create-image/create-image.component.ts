/* eslint-disable no-console */
import { AfterViewInit, Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DifferenceService } from '@app/services/difference/difference.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CANVAS, DIFFERENCE, DRAWING, ERROR_MESSAGES } from '@common/constants';

@Component({
    selector: 'app-create-image',
    templateUrl: './create-image.component.html',
    styleUrls: ['./create-image.component.scss'],
})
export class CreateImageComponent implements AfterViewInit {
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
    @ViewChild('saveTemplate', { static: true })
    saveTemplate: TemplateRef<unknown>;

    @Input() errorMessage: string;
    @Input() nbDiff: number;
    @Input() difficulty: string;

    ctxOriginal: CanvasRenderingContext2D | null;
    ctxModifiable: CanvasRenderingContext2D | null;
    ctxDiff: CanvasRenderingContext2D | null;

    originalImage: ImageBitmap | undefined;
    modifiableImage: ImageBitmap | undefined;

    diffCanvas: HTMLCanvasElement;
    canvasImages: File[] = [];

    gameName: string = '';

    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        public difference: DifferenceService,
        private communication: CommunicationService,
        private router: Router,
        private drawingService: DrawingService,
    ) {}

    ngAfterViewInit(): void {
        this.ctxOriginal = this.originalCanvas.nativeElement.getContext('2d');
        this.ctxModifiable = this.modifiableCanvas.nativeElement.getContext('2d');
        if (this.ctxOriginal && this.ctxModifiable) {
            this.ctxOriginal.fillStyle = DRAWING.WHITE;
            this.ctxModifiable.fillStyle = DRAWING.WHITE;
            this.ctxOriginal.fillRect(CANVAS.CORNER, CANVAS.CORNER, CANVAS.WIDTH, CANVAS.HEIGHT);
            this.ctxModifiable.fillRect(CANVAS.CORNER, CANVAS.CORNER, CANVAS.WIDTH, CANVAS.HEIGHT);
            this.drawingService.saveAction();
        }
    }

    showInputDifferent(): void {
        this.canvasImages.length = CANVAS.RESET;
        this.dialog.open(this.inputDifferentTemplate, {
            width: '500px',
            height: '250px',
        });
    }
    showInputSame(): void {
        this.canvasImages.length = CANVAS.RESET;
        this.dialog.open(this.inputSameTemplate, {
            width: '450px',
            height: '200px',
        });
    }
    showError(errorMessage: string): void {
        this.errorMessage = errorMessage;
        this.dialog.open(this.errorTemplate, {
            width: '250px',
            height: '250px',
        });
    }
    showSave(): void {
        this.dialog.open(this.saveTemplate, {
            width: '250px',
            height: '200px',
        });
    }
    showDifference(): void {
        this.dialog.open(this.negativeTemplate, {
            width: '700px',
            height: '650px',
        });
        this.diffCanvas = document.getElementById('diff') as HTMLCanvasElement;
        this.ctxDiff = this.diffCanvas.getContext('2d', { willReadFrequently: true });

        const diff = this.createDifference();
        if (this.ctxDiff) {
            this.ctxDiff.clearRect(CANVAS.CORNER, CANVAS.CORNER, CANVAS.WIDTH, CANVAS.HEIGHT);
            this.ctxDiff.drawImage(diff, CANVAS.CORNER, CANVAS.CORNER, CANVAS.WIDTH, CANVAS.HEIGHT);
        }
        this.nbDiff = this.difference.getDifference(this.diffCanvas).count;
        this.difficulty = this.difference.isDifficult(this.diffCanvas) ? DIFFERENCE.DIFFICULT : DIFFERENCE.EASY;
    }
    async storeOriginal(fileEvent: Event): Promise<void> {
        if (!(fileEvent.target instanceof HTMLInputElement) || !fileEvent.target.files) {
            this.showError(ERROR_MESSAGES.FORMATERROR_MSG);
            return;
        }
        const selectedFile = fileEvent.target.files[0];
        if (!selectedFile) {
            this.showError(ERROR_MESSAGES.FORMATERROR_MSG);
            return;
        }
        if (await this.verifyBMP(selectedFile)) {
            const image = await this.convertImage(selectedFile);
            if (image.width === CANVAS.WIDTH || image.height === CANVAS.HEIGHT) {
                this.originalImage = image;
                return;
            }
        }
        fileEvent.target.value = '';
        this.showError(ERROR_MESSAGES.FORMATERROR_MSG);
    }
    async storeDiff(fileEvent: Event): Promise<void> {
        if (!(fileEvent.target instanceof HTMLInputElement) || !fileEvent.target.files) {
            this.showError(ERROR_MESSAGES.FORMATERROR_MSG);
            return;
        }
        const selectedFile = fileEvent.target.files[0];
        if (selectedFile) {
            if (await this.verifyBMP(selectedFile)) {
                const image = await this.convertImage(selectedFile);
                if (image.width === CANVAS.WIDTH || image.height === CANVAS.HEIGHT) {
                    this.modifiableImage = image;
                    return;
                }
            }
        }

        this.showError(ERROR_MESSAGES.FORMATERROR_MSG);
    }
    createDiffCanvas(): void {
        if (this.originalImage) {
            this.ctxOriginal?.drawImage(this.originalImage, CANVAS.CORNER, CANVAS.CORNER, CANVAS.WIDTH, CANVAS.HEIGHT);
        }
        if (this.modifiableImage) {
            this.ctxModifiable?.drawImage(this.modifiableImage, CANVAS.CORNER, CANVAS.CORNER, CANVAS.WIDTH, CANVAS.HEIGHT);
        }
        this.originalImage = undefined;
        this.modifiableImage = undefined;
    }
    async createSameCanvas(): Promise<void> {
        if (this.originalImage) {
            this.ctxOriginal?.drawImage(this.originalImage, CANVAS.CORNER, CANVAS.CORNER, CANVAS.WIDTH, CANVAS.HEIGHT);
            this.ctxModifiable?.drawImage(this.originalImage, CANVAS.CORNER, CANVAS.CORNER, CANVAS.WIDTH, CANVAS.HEIGHT);
        }
        this.originalImage = undefined;
    }
    deleteOriginal(): void {
        this.ctxOriginal?.fillRect(CANVAS.CORNER, CANVAS.CORNER, CANVAS.WIDTH, CANVAS.HEIGHT);
    }
    deleteModifiable(): void {
        this.ctxModifiable?.fillRect(CANVAS.CORNER, CANVAS.CORNER, CANVAS.WIDTH, CANVAS.HEIGHT);
    }
    deleteBoth(): void {
        this.deleteOriginal();
        this.deleteModifiable();
    }
    createDifference(): HTMLCanvasElement {
        const slider = document.getElementById('slider') as HTMLInputElement;
        const radius = slider.innerHTML as unknown as number;
        const left = this.drawingService.getLeftDrawing(this.originalCanvas.nativeElement);
        const right = this.drawingService.getRightDrawing(this.modifiableCanvas.nativeElement);
        if (left && right) {
            return this.difference.findDifference(left, right, radius);
        }
        return this.diffCanvas;
    }
    async verifyBMP(file: File): Promise<boolean> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const imageData = new Uint8Array(reader.result as ArrayBuffer);
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                resolve(imageData[0] === 66 && imageData[1] === 77 && imageData[28] === 24);
            };
            reader.readAsArrayBuffer(file);
        });
    }
    async convertImage(file: File): Promise<ImageBitmap> {
        return await createImageBitmap(file);
    }

    inputName(): void {
        const diff = this.createDifference();
        const diffCount = this.difference.getDifference(diff).count;
        if (diffCount >= DIFFERENCE.DIFFCOUNT_MIN && diffCount <= DIFFERENCE.DIFFCOUNT_MAX) {
            this.showSave();
            return;
        }
        this.showError(ERROR_MESSAGES.DIFFERROR_MSG);
    }

    async saveGameCard(): Promise<void> {
        if (this.ctxOriginal && this.ctxModifiable) {
            const diff = this.createDifference();
            const difference = this.difference.getDifference(diff);
            const difficulty = this.difference.isDifficult(diff);
            this.verifyName(`${this.gameName}`, async (isVerified) => {
                if (isVerified) {
                    const originalCanvasString = await this.drawingService.base64Left(this.originalCanvas.nativeElement);
                    const modifiableCanvasString = await this.drawingService.base64Right(this.modifiableCanvas.nativeElement);

                    const request = {
                        name: this.gameName,
                        originalImage: originalCanvasString,
                        modifiableImage: modifiableCanvasString,
                        difficulty,
                        count: difference.count,
                        differences: difference.differences,
                    };
                    await this.communication.imagesPost(request).subscribe(() => {
                        this.router.navigate(['config']);
                    });
                } else {
                    this.showError(ERROR_MESSAGES.NAMEERROR_MSG);
                    this.gameName = '';
                }
            });
        }
    }
    verifyName(gameName: string, callback: (isVerified: boolean) => void): void {
        this.communication.getGameNames().subscribe((names: string[]) => {
            let isGameNameVerified = true;
            for (const name of names) {
                if (gameName === name) {
                    isGameNameVerified = false;
                }
            }
            callback(isGameNameVerified);
        });
    }
}
