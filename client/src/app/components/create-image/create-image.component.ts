/* eslint-disable no-console */
import { Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { DifferenceService } from '@app/services/difference.service';

export interface GameSelectionPageData {
    name: string;
    image: string;
    difficulty: boolean;
}

export interface GameplayData {
    name: string;
    images: string[];
    count: number;
    difficulty: boolean;
}

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;
const BMP_MIN = 66;
const BMP_MAX = 77;
const BIT_DEPTH = 24;
const DIFFCOUNT_MAX = 9;
const DIFFCOUNT_MIN = 3;
const DIFFERROR_MSG = 'Vous devez avoir entre 3 et 9 différences';
const FORMATERROR_MSG = 'Le format des images est invalide';
const NAMEERROR_MSG = 'Ce nom est déjà pris ou est vide';
const NOIMAGE_MSG = "Pas d'images";

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
    @ViewChild('saveTemplate', { static: true })
    saveTemplate: TemplateRef<unknown>;
    @Input() errorMessage: string;
    ctxOriginal: CanvasRenderingContext2D | null;
    ctxModifiable: CanvasRenderingContext2D | null;
    canvasImages: File[] = [];
    width: number = SCREEN_WIDTH;
    height: number = SCREEN_HEIGHT;
    originalImage: ImageBitmap;
    modifiableImage: ImageBitmap;
    gameName: string = '';
    htmlInputElement = window.HTMLInputElement;
    diffCanvas: HTMLCanvasElement;

    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        public difference: DifferenceService,
        private communication: CommunicationService,
        private router: Router,
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
        if (!this.originalImage && !this.modifiableImage) {
            this.showError(NOIMAGE_MSG);
            return;
        }
        this.createDifference();
        this.dialog.open(this.negativeTemplate, {
            width: '700px',
            height: '650px',
        });
        const negDiv = document.getElementById('neg') as HTMLDivElement;
        negDiv.appendChild(this.diffCanvas);
        const nbdiff = document.createElement('p');
        nbdiff.innerHTML = "Nombre d'erreur : ".concat(this.difference.getDifference(this.diffCanvas).count.toString());
        negDiv.appendChild(nbdiff);
        const dificulty = document.createElement('p');
        dificulty.innerHTML = 'Difficulté : '.concat(this.difference.isDifficult(this.diffCanvas) ? 'Difficile' : 'Facile');
        negDiv.appendChild(dificulty);
    }
    async storeOriginal(fileEvent: Event): Promise<void> {
        if (!(fileEvent.target instanceof HTMLInputElement) || !fileEvent.target.files) {
            this.showError(FORMATERROR_MSG);
            return;
        }
        const selectedFile = fileEvent.target.files[0];
        if (!selectedFile) {
            this.showError(FORMATERROR_MSG);
            return;
        }
        if (await this.verifyBMP(selectedFile)) {
            const image = await this.convertImage(selectedFile);
            if (image.width === this.width || image.height === this.height) {
                this.originalImage = image;
                return;
            }
        }
        fileEvent.target.value = '';
        this.showError(FORMATERROR_MSG);
    }
    async storeDiff(fileEvent: Event): Promise<void> {
        if (!(fileEvent.target instanceof HTMLInputElement) || !fileEvent.target.files) {
            this.showError(FORMATERROR_MSG);
            return;
        }
        const selectedFile = fileEvent.target.files[0];
        if (selectedFile) {
            if (await this.verifyBMP(selectedFile)) {
                const image = await this.convertImage(selectedFile);
                if (image.width === this.width || image.height === this.height) {
                    this.modifiableImage = image;
                    return;
                }
            }
        }

        this.showError(FORMATERROR_MSG);
    }
    createDiffCanvas(): void {
        if (this.originalImage && this.modifiableImage) {
            this.ctxOriginal?.drawImage(this.originalImage, 0, 0, this.width, this.height);
            this.ctxModifiable?.drawImage(this.modifiableImage, 0, 0, this.width, this.height);
        }
    }
    async createSameCanvas(): Promise<void> {
        if (this.originalImage) {
            this.ctxOriginal?.drawImage(this.originalImage, 0, 0, this.width, this.height);
            this.ctxModifiable?.drawImage(this.originalImage, 0, 0, this.width, this.height);
        }
    }
    deleteOriginal(): void {
        this.ctxOriginal?.clearRect(0, 0, this.width, this.height);
    }
    deleteModifiable(): void {
        this.ctxModifiable?.clearRect(0, 0, this.width, this.height);
    }
    deleteBoth(): void {
        this.deleteOriginal();
        this.deleteModifiable();
    }
    createDifference(): void {
        if (this.ctxOriginal && this.ctxModifiable) {
            const slider = document.getElementById('slider') as HTMLInputElement;
            const radius = slider.innerHTML as unknown as number;
            const diff = this.difference.findDifference(this.ctxOriginal, this.ctxModifiable, radius);
            this.diffCanvas = diff;
        }
    }
    async verifyBMP(file: File): Promise<boolean> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const imageData = new Uint8Array(reader.result as ArrayBuffer);
                resolve(imageData[0] === BMP_MIN && imageData[1] === BMP_MAX && imageData[28] === BIT_DEPTH);
            };
            reader.readAsArrayBuffer(file);
        });
    }
    async convertImage(file: File): Promise<ImageBitmap> {
        return await createImageBitmap(file);
    }

    inputName(): void {
        this.createDifference();
        const diffCount = this.difference.getDifference(this.diffCanvas).count;
        if (diffCount >= DIFFCOUNT_MIN && diffCount <= DIFFCOUNT_MAX) {
            this.showSave();
            return;
        }
        this.showError(DIFFERROR_MSG);
    }

    async saveGameCard(): Promise<void> {
        if (this.ctxOriginal && this.ctxModifiable) {
            this.createDifference();
            const difference = this.difference.getDifference(this.diffCanvas);
            const difficulty = this.difference.isDifficult(this.diffCanvas);
            this.verifyName(`${this.gameName}`, async (isVerified) => {
                if (isVerified) {
                    const originalCanvasString = await this.convertToBase64(this.originalCanvas);
                    const modifiableCanvasString = await this.convertToBase64(this.modifiableCanvas);

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
                    this.showError(NAMEERROR_MSG);
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
    async convertToBase64(canvasRef: ElementRef<HTMLCanvasElement>): Promise<string> {
        return new Promise((resolve, reject) => {
            canvasRef.nativeElement.toBlob((blob) => {
                const reader = new FileReader();
                if (blob) {
                    reader.readAsDataURL(blob);
                    reader.onload = () => {
                        resolve(reader.result as string);
                    };
                    reader.onerror = (error) => {
                        reject(error);
                    };
                }
            });
        });
    }
}
