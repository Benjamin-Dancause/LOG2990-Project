import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DifferenceService {
    findXY(i: number): number[] {
        const x = (i / 4) % 640;
        const y = Math.floor(i / 4 / 640);
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
        const pixels1 = ctx1?.getImageData(0, 0, 640, 480);
        const pixels2 = ctx2?.getImageData(0, 0, 640, 480);
        const diff = ctx1?.createImageData(640, 480);

        if (pixels1?.data.length && pixels2?.data.length && diff?.data.length) {
            for (let i = 0; i < pixels1?.data.length; i += 4) {
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
            for (let i = 0; i < diff?.data.length; i += 4) {
                if (diff.data[i + 3] === 255) {
                    this.drawCircle(this.findXY(i), radius, ctx3 as CanvasRenderingContext2D);
                    i += 4 * radius; // Pour éviter de dessiner plusieurs fois le même cercle
                    if (i >= diff?.data.length) {
                        break;
                    }
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
        const diff = Array.from(Array(640), () => new Array(480).fill(0));
        if (pixels3?.data.length) {
            for (let i = 0; i < pixels3?.data.length; i += 4) {
                const xy = this.findXY(i);
                if (pixels3?.data[i + 3] === 255 && diff[xy[0]][xy[1]] === 0) {
                    count++;
                    const queue = [xy];
                    while (queue.length > 0) {
                        const [x, y] = queue.shift() as number[];
                        if (diff[x][y] === 0) {
                            if (x < 639 && pixels3?.data[(x + 1 + y * 640) * 4 + 3] === 255) {
                                queue.push([x + 1, y]);
                                diff[x][y] = count;
                            }
                            if (x > 0 && pixels3?.data[(x - 1 + y * 640) * 4 + 3] === 255) {
                                queue.push([x - 1, y]);
                                diff[x][y] = count;
                            }
                            if (y < 479 && pixels3?.data[(x + (y + 1) * 640) * 4 + 3] === 255) {
                                queue.push([x, y + 1]);
                                diff[x][y] = count;
                            }
                            if (y > 0 && pixels3?.data[(x + (y - 1) * 640) * 4 + 3] === 255) {
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
