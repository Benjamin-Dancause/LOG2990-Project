/* eslint-disable prefer-const */
import { Injectable } from '@angular/core';
import { ClickResponse } from '@app/classes/click-response';
import { Coords } from '@app/classes/coords';
import { MouseButton } from '@app/classes/mouse-button';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/components/play-area/play-area.component';
import { GameDiffData } from '@app/interfaces/gameDiffData';
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
    private isCheatEnabled = false;
    private cheatTimeout: any;

    constructor(private communicationService: CommunicationService) {
        this.gameName = (localStorage.getItem('gameTitle') as string) || '';
    }

    flashDifferences(coords: Coords[], ctxs : CanvasRenderingContext2D[]) {
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

    cheatMode(ctxs: CanvasRenderingContext2D[]) {
        this.isCheatEnabled = !this.isCheatEnabled
        if (!this.isCheatEnabled) {
            clearInterval(this.cheatTimeout);
            return;
        }
        this.flashAllDifferences(ctxs);
        this.cheatTimeout = setInterval(() => {
            this.flashAllDifferences(ctxs);
        }, SMALLTIMOUT);
    }

    flashAllDifferences(ctxs: CanvasRenderingContext2D[]) {
        this.communicationService.getAllDiffs(this.gameName).subscribe((gameData: GameDiffData) => {
            ctxs[2].fillStyle = 'blue';
            ctxs[3].fillStyle = 'blue';
            const flash = setInterval(() => {
                for (const coordinate of gameData.differences) {
                    for (const coord of coordinate) {
                        ctxs[2].fillRect(coord.x, coord.y, 1, 1);
                        ctxs[3].fillRect(coord.x, coord.y, 1, 1);
                    }
                }
                setTimeout(() => {
                    ctxs[2].clearRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
                    ctxs[3].clearRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
                }, 100);
            }, 200);
            
            setTimeout(() => {
                clearInterval(flash);
            }, 1000);
        });
    }



    updateImages(coords: Coords[], ctxLeft: CanvasRenderingContext2D, ctxRight: CanvasRenderingContext2D) {
        for (let i = 0; i < coords.length; i++) {
            const dataLeft = ctxLeft?.getImageData(coords[i].x, coords[i].y, 1, 1) as ImageData;
            const pixel = dataLeft.data;
            const imageData = new ImageData(pixel, 1, 1);
            ctxRight?.putImageData(imageData, coords[i].x, coords[i].y);
        }
    }

    async checkClick(event: MouseEvent, counter : CounterService, ctxs : CanvasRenderingContext2D[]) {
        if (!this.isClickDisabled && event?.button === MouseButton.Left) {
            const clickedCanvas = event.target as HTMLCanvasElement;
            const context = clickedCanvas.getContext('2d') as CanvasRenderingContext2D;
            context.font = '20px Arial';

            const mousePosition = { x: event.offsetX, y: event.offsetY };

            this.communicationService.sendPosition(this.gameName, mousePosition).subscribe((response: ClickResponse) => {
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

    async getAllDifferences() {
        this.communicationService.getAllDiffs(this.gameName).subscribe((response: GameDiffData) => {
            console.log(response);
        });
    }
}
