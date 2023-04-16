import { Injectable } from '@angular/core';
import { Coords } from '@app/classes/coords';
import { CANVAS } from '@common/constants';
import { ReplayService } from '../replay/replay.service';

@Injectable({
    providedIn: 'root',
})
export class CanvasReplayService {
    contexts: CanvasRenderingContext2D[] = [];
    constructor(private replay: ReplayService) {}

    updateDifferences(coords: Coords[]) {
        this.flashDifferences(coords);
        setTimeout(() => {
            this.updateImages(coords, this.contexts[2], this.contexts[3]);
        }, 2000 / this.replay.replaySpeed);
    }

    flashDifferences(coords: Coords[]) {
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
            }, 100 / this.replay.replaySpeed);
        }, 200 / this.replay.replaySpeed);

        setTimeout(() => {
            clearInterval(flash);
        }, 1000 / this.replay.replaySpeed);
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
    getContexts(ctx: CanvasRenderingContext2D) {
        if (ctx) {
            this.contexts.push(ctx);
        }
    }
    clearContexts(): void {
        this.contexts.length = 0;
    }
}
