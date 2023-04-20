import { Injectable } from '@angular/core';
import { Coords } from '@app/classes/coords';
import { CANVAS, DELAY } from '@common/constants';
import { GameDiffData } from '@common/game-interfaces';
import { CommunicationService } from '../communication/communication.service';

@Injectable({
    providedIn: 'root',
})
export class CanvasReplayService {
    errorSound = new Audio('./assets/erreur.mp3');
    successSound = new Audio('./assets/success.mp3');
    contexts: CanvasRenderingContext2D[] = [];
    replaySpeed: number = 1;
    constructor(private communicationService: CommunicationService) {}

    updateReplaySpeed(speed: number): void {
        this.replaySpeed = speed;
    }

    updateDifferences(coords: Coords[]): void {
        const gameMode = sessionStorage.getItem('gameMode') as string;
        this.flashDifferences(coords);

        setTimeout(() => {
            if (gameMode === 'solo') {
                this.updateImages(coords, this.contexts[2], this.contexts[3]);
            } else {
                this.updateImages(coords, this.contexts[6], this.contexts[7]);
            }
        }, DELAY.BIGTIMEOUT / this.replaySpeed);
    }

    flashDifferences(coords: Coords[]): void {
        this.contexts[0].fillStyle = 'rgba(255, 0, 255, 0.4)';
        this.contexts[1].fillStyle = 'rgba(255, 0, 255, 0.4)';
        const flash = setInterval(() => {
            for (const coordinate of coords) {
                this.contexts[0].fillRect(coordinate.x, coordinate.y, 1, 1);
                this.contexts[1].fillRect(coordinate.x, coordinate.y, 1, 1);
            }
            setTimeout(() => {
                this.contexts[0].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
                this.contexts[1].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
            }, DELAY.SMALLESTTIMEOUT / this.replaySpeed);
        }, DELAY.MINITIMEOUT / this.replaySpeed);

        setTimeout(() => {
            clearInterval(flash);
        }, DELAY.SMALLTIMEOUT / this.replaySpeed);
    }

    flashAllDifferences(differencesFound: number[]): void {
        const gameName = sessionStorage.getItem('gameTitle') as string;
        this.communicationService.getAllDiffs(gameName).subscribe((gameData: GameDiffData) => {
            this.blinkAllDifferences(differencesFound, gameData);
        });
    }

    blinkAllDifferences(differencesFound: number[], gameData: GameDiffData): void {
        this.contexts[0].fillStyle = 'rgba(255, 0, 255, 0.4)';
        this.contexts[1].fillStyle = 'rgba(255, 0, 255, 0.4)';
        let i = 0;
        const flash = setInterval(() => {
            for (const coordinate of gameData.differences) {
                if (!differencesFound.includes(gameData.differences.indexOf(coordinate) + 1)) {
                    for (const coord of coordinate) {
                        this.contexts[0].fillRect(coord.x, coord.y, 1, 1);
                        this.contexts[1].fillRect(coord.x, coord.y, 1, 1);
                    }
                }
            }
            i++;
            setTimeout(() => {
                this.contexts[0].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
                this.contexts[1].clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
            }, 100 / this.replaySpeed);
            if (i === 4) {
                clearInterval(flash);
            }
        }, 200 / this.replaySpeed);
    }

    flashOneDifference1(randomDifference: Coords[], differencesFound: number[]): void {
        const gameName = sessionStorage.getItem('gameTitle') as string;
        this.communicationService.getAllDiffs(gameName).subscribe(({ differences }) => {
            const unfoundDiffs = differences.filter((difference) => !differencesFound.includes(differences.indexOf(difference) + 1));
            if (unfoundDiffs.length > 0) {
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
                this.contexts[0].fillStyle = this.contexts[1].fillStyle = 'yellow';
                const flash = setInterval(() => {
                    this.contexts[0].fillRect(xCoord, yCoord, width, height);
                    this.contexts[1].fillRect(xCoord, yCoord, width, height);
                    setTimeout(
                        () => (this.contexts[0].clearRect(xCoord, yCoord, width, height), this.contexts[1].clearRect(xCoord, yCoord, width, height)),
                        100 / this.replaySpeed,
                    );
                }, 200 / this.replaySpeed);
                setTimeout(() => clearInterval(flash), 1000 / this.replaySpeed);
            }
        });
    }
    flashOneDifference2(randomIndex: number, differencesFound: number[]) {
        const gameName = sessionStorage.getItem('gameTitle') as string;
        this.communicationService.getAllDiffs(gameName).subscribe((gameData: GameDiffData) => {
            const remainingDiffs = gameData.differences.filter(
                (difference) => !differencesFound.includes(gameData.differences.indexOf(difference) + 1),
            );
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
                for (let ctx of this.contexts.slice(0, 1)) {
                    ctx.fillStyle = 'orange';
                    const flash = setInterval(() => {
                        ctx.fillRect(x, y, width, height);
                        setTimeout(() => {
                            ctx.clearRect(x, y, width, height);
                        }, 100 / this.replaySpeed);
                    }, 200 / this.replaySpeed);
                    setTimeout(() => {
                        clearInterval(flash);
                    }, 1000 / this.replaySpeed);
                }
            }
        });
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

    foundPopup(coord: Coords, context: CanvasRenderingContext2D): void {
        context.fillStyle = 'green';
        context.fillText('Trouvé', coord.x, coord.y);
        this.playSuccessSound();
    }

    errorPopup(coord: Coords, context: CanvasRenderingContext2D): void {
        context.fillStyle = 'red';
        context.fillText('Erreur', coord.x, coord.y);
        this.playErrorSound();
        setTimeout(() => {
            context.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
        }, DELAY.SMALLTIMEOUT / this.replaySpeed);
    }

    playErrorSound() {
        this.errorSound.currentTime = 0;
        this.errorSound.playbackRate = this.replaySpeed;
        this.errorSound.play();
    }

    playSuccessSound() {
        this.successSound.currentTime = 0;
        this.successSound.playbackRate = this.replaySpeed;
        this.successSound.play();
    }

    getContexts(ctx: CanvasRenderingContext2D) {
        if (ctx) {
            console.log(ctx);
            this.contexts.push(ctx);
        }
    }
    clearContexts(): void {
        this.contexts = [];
        this.replaySpeed = 1;
    }
}
