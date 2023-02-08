import { Injectable } from '@nestjs/common';
import { writeFile } from 'fs';

@Injectable()
export class GamecardsService {
    async storeImage(image: HTMLImageElement): Promise<void> {
        const canvas = new HTMLCanvasElement();
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        const filePath = `/assets/images`;
        const buffer = canvas.toDataURL('image/jpeg').split(',')[1];
        writeFile(filePath, buffer, { encoding: 'base64' }, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log(`Image was stored at ${filePath}`);
            }
        });
    }
}
