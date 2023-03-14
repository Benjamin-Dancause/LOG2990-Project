/* eslint-disable prefer-const */
import { Injectable } from '@angular/core';
import { ClickResponse } from '@app/classes/click-response';
import { Coords } from '@app/classes/coords';
import { MouseButton } from '@app/classes/mouse-button';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/components/play-area/play-area.component';
import { CommunicationService } from './communication.service';
import { CounterService } from './counter.service';

const BIGTIMEOUT = 2000;
const SMALLTIMOUT = 1000;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    errorSound = new Audio('../../assets/erreur.mp3');
    successSound = new Audio('../../assets/success.mp3');
    private isClickDisabled = false;
    private differenceFound: number[] = [];
    private gameName: string = '';

    constructor(private communicationService: CommunicationService) {
        this.gameName = (localStorage.getItem('gameTitle') as string) || '';
    }

    flashDifferences(coords: Coords[], ctxs: CanvasRenderingContext2D[]) {
        ctxs[2].fillStyle = 'blue';
        ctxs[3].fillStyle = 'blue';
        const flash = setInterval(() => {
            for (const coordinate of coords) {
                ctxs[2].fillRect(coordinate.x, coordinate.y, 1, 1);
                ctxs[3].fillRect(coordinate.x, coordinate.y, 1, 1);
            }
            setTimeout(() => {
                ctxs[2].clearRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
                ctxs[3].clearRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
            }, 100);
        }, 200);

        setTimeout(() => {
            clearInterval(flash);
        }, 1000);
    }

    /*
    flashDifferences(coords: Coords[], ctxs: CanvasRenderingContext2D[]) {
        const fillStyleBackup: (string | CanvasGradient | CanvasPattern)[] = [];
        for (const ctx of ctxs) {
            fillStyleBackup.push(ctx.fillStyle);
            ctx.fillStyle = 'blue';
        }
        const flash = setInterval(() => {
            for (const coordinate of coords) {
                for (const ctx of ctxs) {
                    ctx.fillRect(coordinate.x, coordinate.y, 1, 1);
                }
            }
            setTimeout(() => {
                for (const ctx of ctxs) {
                    ctx.clearRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
                    ctx.fillStyle = fillStyleBackup.shift() as string;
                }
            }, 100);
        }, 200);

        setTimeout(() => {
            clearInterval(flash);
        }, 1000);
    }
    */
    /*
    flashAllPoints(ctxs: CanvasRenderingContext2D[]) {
        const flash = setInterval(() => {
            for (const ctx of ctxs) {
                ctx.fillStyle = 'blue';
                ctx.fillRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
                setTimeout(() => {
                    ctx.clearRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
                }, 100);
            }
        }, 200);

        setTimeout(() => {
            clearInterval(flash);
        }, 1000);
    }
    

    flashDifferences2(coords: Coords[], ctxs: CanvasRenderingContext2D[], isDifference: boolean, differenceNumber: number) {
        let flashIntervalId: number;
        const flashDuration = 1000;
        const flashDelay = 200;

        if (!isDifference || this.differenceFound.includes(differenceNumber)) {
            return;
        }

        const coordinatesToFlash = coords.filter((coordinate) => {
            const pixelData = ctxs[0].getImageData(coordinate.x, coordinate.y, 1, 1).data;
            const isPixelDifferent = pixelData.some((channelValue) => channelValue !== pixelData[0]);
            return isPixelDifferent;
        });

        if (coordinatesToFlash.length === 0) {
            return;
        }

        let isFlashOn = false;
        flashIntervalId = setInterval(() => {
            isFlashOn = !isFlashOn;
            ctxs[2].fillStyle = isFlashOn ? 'blue' : 'white';
            ctxs[3].fillStyle = isFlashOn ? 'blue' : 'white';
            for (const coordinate of coordinatesToFlash) {
                ctxs[2].fillRect(coordinate.x, coordinate.y, 1, 1);
                ctxs[3].fillRect(coordinate.x, coordinate.y, 1, 1);
            }
        }, flashDelay);

        setTimeout(() => {
            clearInterval(flashIntervalId);
            for (const coordinate of coordinatesToFlash) {
                ctxs[2].clearRect(coordinate.x, coordinate.y, 1, 1);
                ctxs[3].clearRect(coordinate.x, coordinate.y, 1, 1);
            }
        }, flashDuration);
    }
    */

    updateImages(coords: Coords[], ctxLeft: CanvasRenderingContext2D, ctxRight: CanvasRenderingContext2D) {
        for (let i = 0; i < coords.length; i++) {
            const dataLeft = ctxLeft?.getImageData(coords[i].x, coords[i].y, 1, 1) as ImageData;
            const pixel = dataLeft.data;
            const imageData = new ImageData(pixel, 1, 1);
            ctxRight?.putImageData(imageData, coords[i].x, coords[i].y);
        }
    }

    async checkClick(event: MouseEvent, counter: CounterService, ctxs: CanvasRenderingContext2D[]) {
        if (!this.isClickDisabled && event?.button === MouseButton.Left) {
            const clickedCanvas = event.target as HTMLCanvasElement;
            const context = clickedCanvas.getContext('2d') as CanvasRenderingContext2D;
            context.font = '20px Arial';

            const mousePosition = { x: event.offsetX, y: event.offsetY };

            this.communicationService.sendPosition(this.gameName, mousePosition).subscribe((response: ClickResponse) => {
                console.log(response);
                if (response.isDifference && !this.differenceFound.includes(response.differenceNumber)) {
                    this.differenceFound.push(response.differenceNumber);
                    context.fillStyle = 'green';
                    context.fillText('Trouvé', mousePosition.x, mousePosition.y);
                    this.successSound.currentTime = 0;
                    // this.counterService.incrementCounter().subscribe();
                    this.successSound.play();
                    this.flashDifferences(response.coords, ctxs);
                    setTimeout(() => {
                        context?.clearRect(0, 0, clickedCanvas.width, clickedCanvas.height);
                        this.updateImages(response.coords, ctxs[0], ctxs[1]);
                    }, BIGTIMEOUT);
                } else {
                    context.fillStyle = 'red';
                    context.fillText('Erreur', mousePosition.x, mousePosition.y);
                    this.errorSound.currentTime = 0;
                    this.errorSound.play();
                    this.isClickDisabled = true;
                    setTimeout(() => {
                        context.clearRect(0, 0, clickedCanvas.width, clickedCanvas.height);
                        this.isClickDisabled = false;
                    }, SMALLTIMOUT);
                }
            });
        }
    }

    clearDifferenceArray() {
        this.differenceFound = [];
    }
}
