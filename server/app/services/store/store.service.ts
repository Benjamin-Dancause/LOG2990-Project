import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class StoreService {
    async storeInfo(name: string, relativePaths: string[]) {
        const info = { name, images: relativePaths };
        const infoPath = path.join(__dirname, '../../assets/data/${name}.json');
        await fs.writeFile(infoPath, JSON.stringify(info));
    }

    async storeImage(name: string, image: string) {
        const filePath = path.join(__dirname, '../../assets/images/${name}.bmp');
        const bmp = Buffer.from(image, 'base64');
        await fs.writeFile(filePath, bmp);
        return filePath;
    }
}
