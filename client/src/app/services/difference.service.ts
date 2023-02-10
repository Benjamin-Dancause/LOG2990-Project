import { Injectable } from '@angular/core';

export const CANVAS_WIDTH = 640;
export const CANVAS_HEIGHT = 480;
export const ARRAY_OFFSET = 4;
export const BLACK = 255;

@Injectable({
    providedIn: 'root',
})
export class DifferenceService {
    findXY(i: number): number[] {
        const x = (i / ARRAY_OFFSET) % CANVAS_WIDTH;
        const y = Math.floor(i / ARRAY_OFFSET / CANVAS_WIDTH);
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
        const pixels1 = ctx1.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT) as ImageData;
        const pixels2 = ctx2.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT) as ImageData;
        const diff = ctx1.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT) as ImageData;

        for (let i = 0; i < (pixels1.data.length as number); i += ARRAY_OFFSET) {
            if (
                pixels1.data[i] !== pixels2.data[i] ||
                pixels1.data[i + 1] !== pixels2.data[i + 1] ||
                pixels1.data[i + 2] !== pixels2.data[i + 2] ||
                pixels1.data[i + 3] !== pixels2.data[i + 3]
            ) {
                diff.data[i] = 0;
                diff.data[i + 1] = 0;
                diff.data[i + 2] = 0;
                diff.data[i + 3] = BLACK;
            }
        }
        const canvas3 = document.createElement('canvas') as HTMLCanvasElement;
        canvas3.width = CANVAS_WIDTH;
        canvas3.height = CANVAS_HEIGHT;
        const ctx3 = canvas3.getContext('2d') as CanvasRenderingContext2D;
        ctx3.putImageData(diff, 0, 0);
        for (let i = 0; i < diff.data.length; i += ARRAY_OFFSET) {
            if (diff.data[i + 3] === BLACK) {
                this.drawCircle(this.findXY(i), radius, ctx3 as CanvasRenderingContext2D);
                i += ARRAY_OFFSET * radius;
            }
        }
        return canvas3;
    }

    countDifference(canvas: HTMLCanvasElement): number {
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const pixels3 = ctx.getImageData(0, 0, canvas.width, canvas.height) as ImageData;
        let count = 0;
        const diff = Array.from(Array(CANVAS_WIDTH), () => new Array(CANVAS_HEIGHT).fill(0));

        for (let i = 0; i < (pixels3.data.length as number); i += ARRAY_OFFSET) {
            const xy = this.findXY(i);
            if (pixels3.data[i + 3] === BLACK && diff[xy[0]][xy[1]] === 0) {
                count++;
                const queue = [xy];
                while (queue.length > 0) {
                    const [x, y] = queue.shift() as number[];
                    if (diff[x][y] === 0) {
                        if (x < CANVAS_WIDTH - 1 && pixels3.data[(x + 1 + y * CANVAS_WIDTH) * ARRAY_OFFSET + 3] === BLACK) {
                            queue.push([x + 1, y]);
                            diff[x][y] = count;
                        }
                        if (x > 0 && pixels3.data[(x - 1 + y * CANVAS_WIDTH) * ARRAY_OFFSET + 3] === BLACK) {
                            queue.push([x - 1, y]);
                            diff[x][y] = count;
                        }
                        if (y < CANVAS_HEIGHT - 1 && pixels3.data[(x + (y + 1) * CANVAS_WIDTH) * ARRAY_OFFSET + 3] === BLACK) {
                            queue.push([x, y + 1]);
                            diff[x][y] = count;
                        }
                        if (y > 0 && pixels3.data[(x + (y - 1) * CANVAS_WIDTH) * ARRAY_OFFSET + 3] === BLACK) {
                            queue.push([x, y - 1]);
                            diff[x][y] = count;
                        }
                    }
                }
            }
        }

        return count;
    }

    isDifficult(canvas: HTMLCanvasElement): boolean {
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const pixels3 = ctx.getImageData(0, 0, canvas.width, canvas.height) as ImageData;
        let count = 0;
        for (let i = 0; i < (pixels3.data.length as number); i += ARRAY_OFFSET) {
            if (pixels3.data[i + 3] === BLACK) {
                count++;
            }
        }
        return count / (CANVAS_WIDTH * CANVAS_HEIGHT) <= DIFFICULTY_PIXEL_THRESHOLD && this.countDifference(canvas) >= DIFFICULTY_DIFFRENCE_THRESHOLD;
    }
}
