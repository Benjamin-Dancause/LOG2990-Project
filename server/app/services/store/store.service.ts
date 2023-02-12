import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';

@Injectable()
export class StoreService {
    async storeInfo(name: string, relativePaths: string[]): Promise<void> {
        const info = { name, images: relativePaths };
        const infoPath = `assets/data/${name}.json`;
        await fs.writeFile(infoPath, JSON.stringify(info));
    }

    async storeImage(name: string, image: string): Promise<string> {
        const filePath = `assets/images/${name}.bmp`;
        const b64ImgData = image.replace(/^data:image\/\w+;base64,/, '');
        const bmp = Buffer.from(b64ImgData, 'base64');
        await fs.writeFile(filePath, bmp);
        return filePath;
    }
}
