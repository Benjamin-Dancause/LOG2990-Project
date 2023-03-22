/* eslint-disable prefer-const */
import { EventEmitter, Injectable } from '@angular/core';
import { ClickResponse } from '@app/classes/click-response';
import { Coords } from '@app/classes/coords';
import { MouseButton } from '@app/classes/mouse-button';
import { CommunicationService } from '@app/services/communication/communication.service';
import { CANVAS, DELAY } from '@common/constants';
import { GameDiffData } from '@common/game-interfaces';
import { CounterService } from '../counter/counter.service';
import { SocketService } from '../socket/socket.service';



@Injectable({
    providedIn: 'root',
})
export class GameService {
    errorSound = new Audio('./assets/erreur.mp3');
    successSound = new Audio('./assets/success.mp3');
    errorMessage = new EventEmitter<string>();
    successMessage = new EventEmitter<string>();
    private isClickDisabled = false;
    private differenceFound: number[] = [];
    private gameName: string = '';
    private isCheatEnabled = false;
    private cheatTimeout: any;
    private playAreaCtx: CanvasRenderingContext2D[] = [];

    constructor(private communicationService: CommunicationService, private counterService: CounterService, private socketService: SocketService) {
        this.socketService.socket.on('update-difference', (response: ClickResponse) => {
            this.updateDifferences(response);
        });
    }

    getContexts(ctx: CanvasRenderingContext2D) {
        if (ctx) {
            this.playAreaCtx.push(ctx);
        }
    }

    updateDifferences(response: ClickResponse) {
        this.differenceFound.push(response.differenceNumber);
        this.flashDifferences(response.coords, this.playAreaCtx);
        setTimeout(() => {
            this.updateImages(response.coords, this.playAreaCtx[2], this.playAreaCtx[3]);
        }, DELAY.BIGTIMEOUT);
    }

    flashDifferences(coords: Coords[], ctxs: CanvasRenderingContext2D[]) {
        ctxs[0].fillStyle = 'blue';
        ctxs[1].fillStyle = 'blue';
        const flash = setInterval(() => {
            for (const coordinate of coords) {
                ctxs[0].fillRect(coordinate.x, coordinate.y, 1, 1);
                ctxs[1].fillRect(coordinate.x, coordinate.y, 1, 1);
            }
            setTimeout(() => {
                ctxs[0].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
                ctxs[1].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
            }, 100);
        }, 200);

        setTimeout(() => {
            clearInterval(flash);
        }, 1000);
    }

    cheatMode(ctxs: CanvasRenderingContext2D[]) {
        this.isCheatEnabled = !this.isCheatEnabled;
        if (!this.isCheatEnabled) {
            clearInterval(this.cheatTimeout);
            return;
        }
        this.flashAllDifferences(ctxs);
        this.cheatTimeout = setInterval(() => {
            this.flashAllDifferences(ctxs);
        }, DELAY.SMALLTIMEOUT);
    }

    flashAllDifferences(ctxs: CanvasRenderingContext2D[]) {
        this.communicationService.getAllDiffs(this.gameName).subscribe((gameData: GameDiffData) => {
            this.blinkAllDifferences(ctxs, gameData);
        });
    }

    blinkAllDifferences(ctxs: CanvasRenderingContext2D[], gameData: GameDiffData) {
        ctxs[2].fillStyle = 'blue';
        ctxs[3].fillStyle = 'blue';
        let i = 0;
        const flash = setInterval(() => {
            for (const coordinate of gameData.differences) {
                if (!this.differenceFound.includes(gameData.differences.indexOf(coordinate) + 1)) {
                    for (const coord of coordinate) {
                        ctxs[2].fillRect(coord.x, coord.y, 1, 1);
                        ctxs[3].fillRect(coord.x, coord.y, 1, 1);
                    }
                }
            }
            i++;
            setTimeout(() => {
                ctxs[2].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
                ctxs[3].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
            }, 100);
            if (i === 4) {
                clearInterval(flash);
            }
        }, 200);
    }

    setGameName() {
        this.gameName = (sessionStorage.getItem('gameTitle') as string) || '';
    }

    updateImages(coords: Coords[], ctxLeft: CanvasRenderingContext2D, ctxRight: CanvasRenderingContext2D) {
        for (let i = 0; i < coords.length; i++) {
            const dataLeft = ctxLeft?.getImageData(coords[i].x, coords[i].y, 1, 1) as ImageData;
            const pixel = dataLeft.data;
            const imageData = new ImageData(pixel, 1, 1);
            ctxRight?.putImageData(imageData, coords[i].x, coords[i].y);
        }
    }

    incrementCounter() {
        this.counterService.incrementCounter(
            (sessionStorage.getItem('userName') as string) === (sessionStorage.getItem('gameMaster') as string) ? true : false);
    }

    playErrorSound() {
        this.errorSound.currentTime = 0;
        this.errorSound.play();
    }

    playSuccessSound() {
        this.successSound.currentTime = 0;
        this.successSound.play();
    }



    async checkClick(event: MouseEvent, counter: CounterService, ctxs: CanvasRenderingContext2D[]) {
        if (!this.isClickDisabled && event?.button === MouseButton.Left) {
            const clickedCanvas = event.target as HTMLCanvasElement;
            const context = clickedCanvas.getContext('2d') as CanvasRenderingContext2D;
            context.font = '20px Arial';

            const mousePosition = { x: event.offsetX, y: event.offsetY };

            this.communicationService.sendPosition(this.gameName, mousePosition).subscribe((response: ClickResponse) => {
                if (response.isDifference && !this.differenceFound.includes(response.differenceNumber)) {
                    this.successMessage.emit('Trouvé');
                    context.fillStyle = 'green';
                    context.fillText('Trouvé', mousePosition.x, mousePosition.y);
                    this.socketService.sendDifferenceFound(response);
                    this.incrementCounter();
                    this.playSuccessSound();
                } else {
                    this.errorMessage.emit('Erreur par le joueur');
                    context.fillStyle = 'red';
                    context.fillText('Erreur', mousePosition.x, mousePosition.y);
                    this.playErrorSound();
                    this.isClickDisabled = true;
                    setTimeout(() => {
                        context.clearRect(0, 0, clickedCanvas.width, clickedCanvas.height);
                        this.isClickDisabled = false;
                    }, DELAY.SMALLTIMEOUT);
                }
            });
        }
    }

    clearContexts(): void {
        this.playAreaCtx = [];
    }

    clearDifferenceArray() {
        this.differenceFound = [];
        this.isCheatEnabled = false;
    }
}
