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

    hintMode1(ctxs: CanvasRenderingContext2D[]) {
        this.isHintModeEnabled = !this.isHintModeEnabled;
        if (!this.isHintModeEnabled) {
            clearInterval(this.cheatTimeout);
            return;
        }
        this.flashOneDifference1(ctxs);
        this.cheatTimeout = setTimeout(() => {
            this.isHintModeEnabled = false;
            clearInterval(this.cheatTimeout);
        }, 1000);
    }

    flashOneDifference1(ctxs: CanvasRenderingContext2D[]) {
        this.communicationService.getAllDiffs(this.gameName).subscribe((gameData: GameDiffData) => {
            const firstDifference = gameData.differences.find(
                (difference) => !this.differenceFound.includes(gameData.differences.indexOf(difference) + 1),
            );
            if (firstDifference) {
                const coords = firstDifference;
                const quarterWidth = Math.round(CANVAS.WIDTH / 4);
                const quarterHeight = Math.round(CANVAS.HEIGHT / 4);
                let minX = Number.MAX_VALUE;
                let minY = Number.MAX_VALUE;
                let maxX = Number.MIN_VALUE;
                let maxY = Number.MIN_VALUE;
                for (const coord of coords) {
                    if (coord.x < minX) {
                        minX = coord.x;
                    }
                    if (coord.y < minY) {
                        minY = coord.y;
                    }
                    if (coord.x > maxX) {
                        maxX = coord.x;
                    }
                    if (coord.y > maxY) {
                        maxY = coord.y;
                    }
                }
                const centerX = Math.round((minX + maxX) / 2);
                const centerY = Math.round((minY + maxY) / 2);
                const x = centerX <= CANVAS.WIDTH / 2 ? 0 : CANVAS.WIDTH - quarterWidth * 2;
                const y = centerY <= CANVAS.HEIGHT / 2 ? 0 : CANVAS.HEIGHT - quarterHeight * 2;

                const width = Math.min(quarterWidth * 2, CANVAS.WIDTH - x);
                const height = Math.min(quarterHeight * 2, CANVAS.HEIGHT - y);
                ctxs[2].fillStyle = 'yellow';
                ctxs[3].fillStyle = 'yellow';
                const flash = setInterval(() => {
                    ctxs[2].fillRect(x, y, width, height);
                    ctxs[3].fillRect(x, y, width, height);
                    setTimeout(() => {
                        ctxs[2].clearRect(x, y, width, height);
                        ctxs[3].clearRect(x, y, width, height);
                    }, 100);
                }, 200);
                setTimeout(() => {
                    clearInterval(flash);
                }, 1000);
            }
        });
    }

    blinkDifference1(ctxs: CanvasRenderingContext2D[], difference: Coords[]) {
        ctxs[2].fillStyle = 'yellow';
        ctxs[3].fillStyle = 'yellow';
        const flash = setInterval(() => {
            for (const coord of difference) {
                ctxs[2].fillRect(coord.x, coord.y, 1, 1);
                ctxs[3].fillRect(coord.x, coord.y, 1, 1);
            }
            setTimeout(() => {
                ctxs[2].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
                ctxs[3].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
            }, 100);
        }, 200);

        setTimeout(() => {
            clearInterval(flash);
        }, 1000);
    }

    hintMode2(ctxs: CanvasRenderingContext2D[]) {
        this.isHintModeEnabled = !this.isHintModeEnabled;
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
            const firstDifference = gameData.differences.find(
                (difference) => !this.differenceFound.includes(gameData.differences.indexOf(difference) + 1),
            );
            if (firstDifference) {
                const coords = firstDifference;
                const quarterWidth = Math.round(CANVAS.WIDTH / 4);
                const quarterHeight = Math.round(CANVAS.HEIGHT / 4);
                let minX = Number.MAX_VALUE;
                let minY = Number.MAX_VALUE;
                let maxX = Number.MIN_VALUE;
                let maxY = Number.MIN_VALUE;
                for (const coord of coords) {
                    if (coord.x < minX) {
                        minX = coord.x;
                    }
                    if (coord.y < minY) {
                        minY = coord.y;
                    }
                    if (coord.x > maxX) {
                        maxX = coord.x;
                    }
                    if (coord.y > maxY) {
                        maxY = coord.y;
                    }
                }
                const centerX = Math.round((minX + maxX) / 2);
                const centerY = Math.round((minY + maxY) / 2);
                let x: number;
                let y: number;
                let width: number;
                let height: number;
                if (centerX < quarterWidth) {
                    x = 0;
                    width = quarterWidth;
                } else if (centerX < quarterWidth * 2) {
                    x = quarterWidth;
                    width = quarterWidth;
                } else if (centerX < quarterWidth * 3) {
                    x = quarterWidth * 2;
                    width = quarterWidth;
                } else {
                    x = quarterWidth * 3;
                    width = quarterWidth;
                }
                if (centerY < quarterHeight) {
                    y = 0;
                    height = quarterHeight;
                } else if (centerY < quarterHeight * 2) {
                    y = quarterHeight;
                    height = quarterHeight;
                } else if (centerY < quarterHeight * 3) {
                    y = quarterHeight * 2;
                    height = quarterHeight;
                } else {
                    y = quarterHeight * 3;
                    height = quarterHeight;
                }
                ctxs[2].fillStyle = 'orange';
                ctxs[3].fillStyle = 'orange';
                const flash = setInterval(() => {
                    ctxs[2].fillRect(x, y, width, height);
                    ctxs[3].fillRect(x, y, width, height);
                    setTimeout(() => {
                        ctxs[2].clearRect(x, y, width, height);
                        ctxs[3].clearRect(x, y, width, height);
                    }, 100);
                }, 200);
                setTimeout(() => {
                    clearInterval(flash);
                }, 1000);
            }
        });
    }

    blinkDifference2(ctxs: CanvasRenderingContext2D[], difference: Coords[]) {
        ctxs[2].fillStyle = 'orange';
        ctxs[3].fillStyle = 'orange';
        const flash = setInterval(() => {
            for (const coord of difference) {
                ctxs[2].fillRect(coord.x, coord.y, 1, 1);
                ctxs[3].fillRect(coord.x, coord.y, 1, 1);
            }
            setTimeout(() => {
                ctxs[2].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
                ctxs[3].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
            }, 100);
        }, 200);

        setTimeout(() => {
            clearInterval(flash);
        }, 1000);
    }

    hintMode3(ctxs: CanvasRenderingContext2D[]) {
        this.isHintModeEnabled = !this.isHintModeEnabled;
        if (!this.isHintModeEnabled) {
            clearInterval(this.cheatTimeout);
            return;
        }
        this.flashOneDifference3(ctxs);
        this.cheatTimeout = setTimeout(() => {
            this.isHintModeEnabled = false;
            clearInterval(this.cheatTimeout);
        }, 1000);
    }

    flashOneDifference3(ctxs: CanvasRenderingContext2D[]) {
        this.communicationService.getAllDiffs(this.gameName).subscribe((gameData: GameDiffData) => {
            const firstDifference = gameData.differences.find(
                (difference) => !this.differenceFound.includes(gameData.differences.indexOf(difference) + 1),
            );
            if (firstDifference) {
                this.blinkDifference3(ctxs, firstDifference);
            }
        });
    }

    blinkDifference3(ctxs: CanvasRenderingContext2D[], difference: Coords[]) {
        ctxs[2].fillStyle = 'violet';
        ctxs[3].fillStyle = 'violet';
        const flash = setInterval(() => {
            for (const coord of difference) {
                ctxs[2].fillRect(coord.x, coord.y, 1, 1);
                ctxs[3].fillRect(coord.x, coord.y, 1, 1);
            }
            setTimeout(() => {
                ctxs[2].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
                ctxs[3].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
            }, 100);
        }, 200);

        setTimeout(() => {
            clearInterval(flash);
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

// Si tu veux flash l'indice 3 au hasard
/*
hintMode3(ctxs: CanvasRenderingContext2D[]) {
    this.isHintModeEnabled = !this.isHintModeEnabled;
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
        const differences = gameData.differences.filter((difference) => !this.differenceFound.includes(gameData.differences.indexOf(difference) + 1));
        if (differences.length > 0) {
            const randomDifference = differences[Math.floor(Math.random() * differences.length)];
            this.blinkDifference3(ctxs, randomDifference);
        }
    });
}

blinkDifference3(ctxs: CanvasRenderingContext2D[], difference: Coords[]) {
    ctxs[2].fillStyle = 'violet';
    ctxs[3].fillStyle = 'violet';
    const flash = setInterval(() => {
        for (const coord of difference) {
            ctxs[2].fillRect(coord.x, coord.y, 1, 1);
            ctxs[3].fillRect(coord.x, coord.y, 1, 1);
        }
        setTimeout(() => {
            ctxs[2].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
            ctxs[3].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
        }, 100);
    }, 200);

    setTimeout(() => {
        clearInterval(flash);
    }, 1000);
}

*/

// Si tu veux flash l'indice 1 au hasard
/*
hintMode1(ctxs: CanvasRenderingContext2D[]) {
        this.isHintModeEnabled = !this.isHintModeEnabled;
        if (!this.isHintModeEnabled) {
            clearInterval(this.cheatTimeout);
            return;
        }
        this.flashOneDifference1(ctxs);
        this.cheatTimeout = setTimeout(() => {
            this.isHintModeEnabled = false;
            clearInterval(this.cheatTimeout);
        }, 1000);
    }

    flashOneDifference1(ctxs: CanvasRenderingContext2D[]) {
        this.communicationService.getAllDiffs(this.gameName).subscribe((gameData: GameDiffData) => {
            const differences = gameData.differences.filter(
                (difference) => !this.differenceFound.includes(gameData.differences.indexOf(difference) + 1),
            );
            if (differences.length > 0) {
                const randomDifference = differences[Math.floor(Math.random() * differences.length)];
                const coords = randomDifference;
                const quarterWidth = Math.round(CANVAS.WIDTH / 4);
                const quarterHeight = Math.round(CANVAS.HEIGHT / 4);
                let minX = Number.MAX_VALUE;
                let minY = Number.MAX_VALUE;
                let maxX = Number.MIN_VALUE;
                let maxY = Number.MIN_VALUE;
                for (const coord of coords) {
                    if (coord.x < minX) {
                        minX = coord.x;
                    }
                    if (coord.y < minY) {
                        minY = coord.y;
                    }
                    if (coord.x > maxX) {
                        maxX = coord.x;
                    }
                    if (coord.y > maxY) {
                        maxY = coord.y;
                    }
                }
                const centerX = Math.round((minX + maxX) / 2);
                const centerY = Math.round((minY + maxY) / 2);
                const x = centerX <= CANVAS.WIDTH / 2 ? 0 : CANVAS.WIDTH - quarterWidth * 2;
                const y = centerY <= CANVAS.HEIGHT / 2 ? 0 : CANVAS.HEIGHT - quarterHeight * 2;

                const width = Math.min(quarterWidth * 2, CANVAS.WIDTH - x);
                const height = Math.min(quarterHeight * 2, CANVAS.HEIGHT - y);
                ctxs[2].fillStyle = 'yellow';
                ctxs[3].fillStyle = 'yellow';
                const flash = setInterval(() => {
                    ctxs[2].fillRect(x, y, width, height);
                    ctxs[3].fillRect(x, y, width, height);
                    setTimeout(() => {
                        ctxs[2].clearRect(x, y, width, height);
                        ctxs[3].clearRect(x, y, width, height);
                    }, 100);
                }, 200);
                setTimeout(() => {
                    clearInterval(flash);
                }, 1000);
            }
        });
    }
*/

// Si tu veux flash l'indice 2 au hasard
/*
flashOneDifference2(ctxs: CanvasRenderingContext2D[]) {
        this.communicationService.getAllDiffs(this.gameName).subscribe((gameData: GameDiffData) => {
            const remainingDiffs = gameData.differences.filter(
                (difference) => !this.differenceFound.includes(gameData.differences.indexOf(difference) + 1),
            );
            const randomIndex = Math.floor(Math.random() * remainingDiffs.length);
            const randomDifference = remainingDiffs[randomIndex];

            if (randomDifference) {
                const coords = randomDifference;
                const quarterWidth = Math.round(CANVAS.WIDTH / 4);
                const quarterHeight = Math.round(CANVAS.HEIGHT / 4);
                let minX = Number.MAX_VALUE;
                let minY = Number.MAX_VALUE;
                let maxX = Number.MIN_VALUE;
                let maxY = Number.MIN_VALUE;
                for (const coord of coords) {
                    if (coord.x < minX) {
                        minX = coord.x;
                    }
                    if (coord.y < minY) {
                        minY = coord.y;
                    }
                    if (coord.x > maxX) {
                        maxX = coord.x;
                    }
                    if (coord.y > maxY) {
                        maxY = coord.y;
                    }
                }
                const centerX = Math.round((minX + maxX) / 2);
                const centerY = Math.round((minY + maxY) / 2);
                let x: number;
                let y: number;
                let width: number;
                let height: number;
                if (centerX < quarterWidth) {
                    x = 0;
                    width = quarterWidth;
                } else if (centerX < quarterWidth * 2) {
                    x = quarterWidth;
                    width = quarterWidth;
                } else if (centerX < quarterWidth * 3) {
                    x = quarterWidth * 2;
                    width = quarterWidth;
                } else {
                    x = quarterWidth * 3;
                    width = quarterWidth;
                }
                if (centerY < quarterHeight) {
                    y = 0;
                    height = quarterHeight;
                } else if (centerY < quarterHeight * 2) {
                    y = quarterHeight;
                    height = quarterHeight;
                } else if (centerY < quarterHeight * 3) {
                    y = quarterHeight * 2;
                    height = quarterHeight;
                } else {
                    y = quarterHeight * 3;
                    height = quarterHeight;
                }
                ctxs[2].fillStyle = 'orange';
                ctxs[3].fillStyle = 'orange';
                const flash = setInterval(() => {
                    ctxs[2].fillRect(x, y, width, height);
                    ctxs[3].fillRect(x, y, width, height);
                    setTimeout(() => {
                        ctxs[2].clearRect(x, y, width, height);
                        ctxs[3].clearRect(x, y, width, height);
                    }, 100);
                }, 200);
                setTimeout(() => {
                    clearInterval(flash);
                }, 1000);
            }
        });
    }
*/
