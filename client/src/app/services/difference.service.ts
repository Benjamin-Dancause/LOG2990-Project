import { Injectable } from '@angular/core';

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;
const SMALLER_WIDTH = 639;
const SMALLER_HEIGHT = 479;
const PIXELS = 4;
const BYTE = 255;

@Injectable({
    providedIn: 'root',
})
export class DifferenceService {
    findXY(i: number): number[] {
        const x = (i / PIXELS) % SCREEN_WIDTH;
        const y = Math.floor(i / PIXELS / SCREEN_WIDTH);
        return [x, y];
    }

    drawCircle(xy: number[], r: number, ctx: CanvasRenderingContext2D): void {
        if (r === 0) {
            return;
        }
        ctx.beginPath();
        ctx.arc(xy[0], xy[1], r, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.stroke();
    }

    findDifference(ctx1: CanvasRenderingContext2D, ctx2: CanvasRenderingContext2D, radius: number): HTMLCanvasElement {
        const pixels1 = ctx1?.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        const pixels2 = ctx2?.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        const diff = ctx1?.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);

        if (pixels1?.data.length && pixels2?.data.length && diff?.data.length) {
            for (let i = 0; i < pixels1?.data.length; i += PIXELS) {
                if (
                    pixels1?.data[i] !== pixels2?.data[i] ||
                    pixels1?.data[i + 1] !== pixels2?.data[i + 1] ||
                    pixels1?.data[i + 2] !== pixels2?.data[i + 2] ||
                    pixels1?.data[i + 3] !== pixels2?.data[i + 3]
                ) {
                    diff.data[i] = 0;
                    diff.data[i + 1] = 0;
                    diff.data[i + 2] = 0;
                    diff.data[i + 3] = 255;
                }
            }
            const canvas3 = document.createElement('canvas') as HTMLCanvasElement;
            canvas3.width = 640;
            canvas3.height = 480;
            const ctx3 = canvas3.getContext('2d');
            ctx3?.putImageData(diff, 0, 0);
            for (let i = 0; i < diff?.data.length; i += PIXELS) {
                if (diff.data[i + 3] === BYTE) {
                    this.drawCircle(this.findXY(i), radius, ctx3 as CanvasRenderingContext2D);
                    i += PIXELS * radius;
                }
            }
            return canvas3;
        } else {
            throw new Error("Un des canvas n'a pas été chargé correctement");
        }
    }

    countDifference(canvas: HTMLCanvasElement): number {
        const ctx = canvas.getContext('2d');
        const pixels3 = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        let count = 0;
        const diff = Array.from(Array(SCREEN_WIDTH), () => new Array(SCREEN_HEIGHT).fill(0));
        if (pixels3?.data.length) {
            for (let i = 0; i < pixels3?.data.length; i += PIXELS) {
                const xy = this.findXY(i);
                if (pixels3?.data[i + 3] === BYTE && diff[xy[0]][xy[1]] === 0) {
                    count++;
                    const queue = [xy];
                    while (queue.length > 0) {
                        const [x, y] = queue.shift() as number[];
                        if (diff[x][y] === 0) {
                            if (x < SMALLER_WIDTH && pixels3?.data[(x + 1 + y * SCREEN_WIDTH) * PIXELS + 3] === BYTE) {
                                queue.push([x + 1, y]);
                                diff[x][y] = count;
                            }
                            if (x > 0 && pixels3?.data[(x - 1 + y * SCREEN_WIDTH) * PIXELS + 3] === BYTE) {
                                queue.push([x - 1, y]);
                                diff[x][y] = count;
                            }
                            if (y < SMALLER_HEIGHT && pixels3?.data[(x + (y + 1) * SCREEN_WIDTH) * PIXELS + 3] === BYTE) {
                                queue.push([x, y + 1]);
                                diff[x][y] = count;
                            }
                            if (y > 0 && pixels3?.data[(x + (y - 1) * SCREEN_WIDTH) * PIXELS + 3] === BYTE) {
                                queue.push([x, y - 1]);
                                diff[x][y] = count;
                            }
                        }
                    }
                }
            }
        }
        return count;
    }
}
