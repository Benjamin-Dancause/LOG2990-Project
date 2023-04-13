/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-restricted-imports */
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
    hintMessage = new EventEmitter<string>();
    private isClickDisabled = false;
    private differenceFound: number[] = [];
    private gameName: string = '';
    private isCheatEnabled = false;
    private isHintModeEnabled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        console.log('Difference number: ' + response.differenceNumber);
        this.differenceFound.push(response.differenceNumber);
        this.flashDifferences(response.coords, this.playAreaCtx);
        setTimeout(() => {
            this.updateImages(response.coords, this.playAreaCtx[2], this.playAreaCtx[3]);
        }, DELAY.BIGTIMEOUT);
    }

    flashDifferences(coords: Coords[], ctxs: CanvasRenderingContext2D[]) {
        ctxs[0].fillStyle = 'rgba(255, 0, 255, 0.4)';
        ctxs[1].fillStyle = 'rgba(255, 0, 255, 0.4)';
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
        ctxs[2].fillStyle = 'rgba(255, 0, 255, 0.4)';
        ctxs[3].fillStyle = 'rgba(255, 0, 255, 0.4)';
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

    hintMode1(ctxs: CanvasRenderingContext2D[]) {
        this.isHintModeEnabled = !this.isHintModeEnabled;
        this.hintMessage.emit();
        if (!this.isHintModeEnabled) {
            clearInterval(this.cheatTimeout);
            return;
        }
        this.flashOneDifference1(ctxs);
        this.cheatTimeout = setTimeout(() => ((this.isHintModeEnabled = false), clearInterval(this.cheatTimeout)), 1000);
    }

    flashOneDifference1(ctxs: CanvasRenderingContext2D[]) {
        this.communicationService.getAllDiffs(this.gameName).subscribe(({ differences }) => {
            const unfoundDiffs = differences.filter((difference) => !this.differenceFound.includes(differences.indexOf(difference) + 1));
            if (unfoundDiffs.length > 0) {
                const randomDifference = unfoundDiffs[Math.floor(Math.random() * unfoundDiffs.length)];
                const quarterWidth = Math.round(CANVAS.WIDTH / 4);
                const quarterHeight = Math.round(CANVAS.HEIGHT / 4);
                const minX = Math.min(...randomDifference.map((d) => d.x));
                const minY = Math.min(...randomDifference.map((d) => d.y));
                const maxX = Math.max(...randomDifference.map((d) => d.x));
                const maxY = Math.max(...randomDifference.map((d) => d.y));
                const centerX = Math.round((minX + maxX) / 2);
                const centerY = Math.round((minY + maxY) / 2);
                const xCoord = centerX <= CANVAS.WIDTH / 2 ? 0 : CANVAS.WIDTH - quarterWidth * 2;
                const yCoord = centerY <= CANVAS.HEIGHT / 2 ? 0 : CANVAS.HEIGHT - quarterHeight * 2;
                const width = Math.min(quarterWidth * 2, CANVAS.WIDTH - xCoord);
                const height = Math.min(quarterHeight * 2, CANVAS.HEIGHT - yCoord);
                ctxs[2].fillStyle = ctxs[3].fillStyle = 'yellow';
                const flash = setInterval(
                    () => (
                        ctxs[2].fillRect(xCoord, yCoord, width, height),
                        ctxs[3].fillRect(xCoord, yCoord, width, height),
                        setTimeout(() => (ctxs[2].clearRect(xCoord, yCoord, width, height), ctxs[3].clearRect(xCoord, yCoord, width, height)), 100)
                    ),
                    200,
                );
                setTimeout(() => clearInterval(flash), 1000);
            }
        });
    }

    hintMode2(ctxs: CanvasRenderingContext2D[]) {
        this.isHintModeEnabled = !this.isHintModeEnabled;
        this.hintMessage.emit();
        if (!this.isHintModeEnabled) {
            clearInterval(this.cheatTimeout);
            return;
        }
        this.flashOneDifference2(ctxs);
        this.cheatTimeout = setTimeout(() => {
            this.isHintModeEnabled = false;
            clearInterval(this.cheatTimeout);
        }, 1000);
    }

    flashOneDifference2(ctxs: CanvasRenderingContext2D[]) {
        this.communicationService.getAllDiffs(this.gameName).subscribe((gameData: GameDiffData) => {
            const remainingDiffs = gameData.differences.filter(
                (difference) => !this.differenceFound.includes(gameData.differences.indexOf(difference) + 1),
            );
            const randomIndex = Math.floor(Math.random() * remainingDiffs.length);
            const coords = remainingDiffs[randomIndex];
            if (coords) {
                const quarterWidth = Math.round(CANVAS.WIDTH / 4);
                const quarterHeight = Math.round(CANVAS.HEIGHT / 4);
                const [minX, minY, maxX, maxY] = coords.reduce(
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    ([minX, minY, maxX, maxY], { x, y }) => [Math.min(minX, x), Math.min(minY, y), Math.max(maxX, x), Math.max(maxY, y)],
                    [Number.MAX_VALUE, Number.MAX_VALUE, Number.MIN_VALUE, Number.MIN_VALUE],
                );
                const centerX = Math.round((minX + maxX) / 2);
                const centerY = Math.round((minY + maxY) / 2);
                const [x, y, width, height] = [
                    // eslint-disable-next-line no-bitwise
                    ((centerX / quarterWidth) | 0) * quarterWidth,
                    // eslint-disable-next-line no-bitwise
                    ((centerY / quarterHeight) | 0) * quarterHeight,
                    quarterWidth,
                    quarterHeight,
                ];
                ctxs.slice(2).forEach((ctx) => {
                    ctx.fillStyle = 'orange';
                    const flash = setInterval(() => {
                        ctx.fillRect(x, y, width, height);
                        setTimeout(() => {
                            ctx.clearRect(x, y, width, height);
                        }, 100);
                    }, 200);
                    setTimeout(() => {
                        clearInterval(flash);
                    }, 1000);
                });
            }
        });
    }

    hintMode3(ctxs: CanvasRenderingContext2D[]) {
        this.isHintModeEnabled = !this.isHintModeEnabled;
        this.hintMessage.emit();
        if (!this.isHintModeEnabled) {
            clearInterval(this.cheatTimeout);
            return;
        }
        this.flashOneRandomDifference(ctxs);
        this.cheatTimeout = setTimeout(() => {
            this.isHintModeEnabled = false;
            clearInterval(this.cheatTimeout);
        }, 1000);
    }

    flashOneRandomDifference(ctxs: CanvasRenderingContext2D[]) {
        this.communicationService.getAllDiffs(this.gameName).subscribe((gameData: GameDiffData) => {
            const differences = gameData.differences.filter(
                (difference) => !this.differenceFound.includes(gameData.differences.indexOf(difference) + 1),
            );
            if (differences.length > 0) {
                const randomDifference = differences[Math.floor(Math.random() * differences.length)];
                this.blinkDifference3(ctxs, randomDifference);
            }
        });
    }

    blinkDifference3(ctxs: CanvasRenderingContext2D[], difference: Coords[]) {
        const canvas1 = ctxs[2].canvas;
        const canvas1MouseMoveHandler = (event: { clientX: number; clientY: number }) => {
            const cursorX = event.clientX - canvas1.getBoundingClientRect().left;
            const cursorY = event.clientY - canvas1.getBoundingClientRect().top;

            const distance = Math.sqrt((cursorX - difference[0].x) ** 2 + (cursorY - difference[0].y) ** 2);
            if (distance < 50) {
                canvas1.style.cursor = 'url(./assets/red-cursor.png) 0 0, auto';
            } else if (distance < 150) {
                canvas1.style.cursor = 'url(./assets/orange-cursor.png) 0 0, auto';
            } else {
                canvas1.style.cursor = 'url(./assets/blue-cursor.png) 0 0, auto';
            }
        };
        canvas1.addEventListener('mousemove', canvas1MouseMoveHandler);

        const canvas2 = ctxs[3].canvas;
        const canvas2MouseMoveHandler = (event: { clientX: number; clientY: number }) => {
            const cursorX = event.clientX - canvas2.getBoundingClientRect().left;
            const cursorY = event.clientY - canvas2.getBoundingClientRect().top;

            const distance = Math.sqrt((cursorX - difference[0].x) ** 2 + (cursorY - difference[0].y) ** 2);
            if (distance < 50) {
                canvas2.style.cursor = 'url(./assets/red-cursor.png) 0 0, auto';
            } else if (distance < 150) {
                canvas2.style.cursor = 'url(./assets/orange-cursor.png) 0 0, auto';
            } else {
                canvas2.style.cursor = 'url(./assets/blue-cursor.png) 0 0, auto';
            }
        };
        canvas2.addEventListener('mousemove', canvas2MouseMoveHandler);
        const handleClick = () => {
            canvas1.style.cursor = 'auto';
            canvas2.style.cursor = 'auto';
            canvas1.removeEventListener('mousemove', canvas1MouseMoveHandler);
            canvas2.removeEventListener('mousemove', canvas2MouseMoveHandler);
            canvas1.removeEventListener('click', handleClick);
            canvas2.removeEventListener('click', handleClick);
        };
        canvas1.addEventListener('click', handleClick);
        canvas2.addEventListener('click', handleClick);

        setTimeout(() => {
            canvas1.style.cursor = 'auto';
            canvas2.style.cursor = 'auto';
        }, 1000);
    }

    setGameName() {
        this.gameName = (sessionStorage.getItem('gameTitle') as string) || '';
    }

    updateImages(coords: Coords[], ctxLeft: CanvasRenderingContext2D, ctxRight: CanvasRenderingContext2D) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < coords.length; i++) {
            const dataLeft = ctxLeft?.getImageData(coords[i].x, coords[i].y, 1, 1) as ImageData;
            if (dataLeft) {
                const pixel = dataLeft.data;
                const imageData = new ImageData(pixel, 1, 1);
                ctxRight?.putImageData(imageData, coords[i].x, coords[i].y);
            }
        }
    }

    incrementCounter() {
        this.counterService.incrementCounter(
            (sessionStorage.getItem('userName') as string) === (sessionStorage.getItem('gameMaster') as string) ? true : false,
        );
    }

    playErrorSound() {
        this.errorSound.currentTime = 0;
        this.errorSound.play();
    }

    playSuccessSound() {
        this.successSound.currentTime = 0;
        this.successSound.play();
    }

    // eslint-disable-next-line no-unused-vars
    async checkClick(event: MouseEvent, counter: CounterService, ctxs: CanvasRenderingContext2D[]) {
        if (!this.isClickDisabled && event?.button === MouseButton.Left) {
            const clickedCanvas = event.target as HTMLCanvasElement;
            const context = clickedCanvas.getContext('2d') as CanvasRenderingContext2D;
            context.font = '20px Arial';

            const mousePosition = { x: event.offsetX, y: event.offsetY };

            this.socketService.socket.off('click-response');
            this.socketService.sendPosition(mousePosition);
            this.socketService.socket.on('click-response', (response: ClickResponse) => {
                // console.log('Response:' + response.isDifference);
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

            // this.communicationService.sendPosition(this.gameName, mousePosition).subscribe((response: ClickResponse) => {
            //     if (response.isDifference && !this.differenceFound.includes(response.differenceNumber)) {
            //         this.successMessage.emit('Trouvé');
            //         context.fillStyle = 'green';
            //         context.fillText('Trouvé', mousePosition.x, mousePosition.y);
            //         this.socketService.sendDifferenceFound(response);
            //         this.incrementCounter();
            //         this.playSuccessSound();
            //     } else {
            //         this.errorMessage.emit('Erreur par le joueur');
            //         context.fillStyle = 'red';
            //         context.fillText('Erreur', mousePosition.x, mousePosition.y);
            //         this.playErrorSound();
            //         this.isClickDisabled = true;
            //         setTimeout(() => {
            //             context.clearRect(0, 0, clickedCanvas.width, clickedCanvas.height);
            //             this.isClickDisabled = false;
            //         }, DELAY.SMALLTIMEOUT);
            //     }
            // });
        }
    }

    // initializeClickResponseListener() {}

    clearContexts(): void {
        this.playAreaCtx = [];
    }

    clearDifferenceArray() {
        this.differenceFound = [];
        this.isCheatEnabled = false;
    }
}
