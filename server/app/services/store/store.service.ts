import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';

interface Data {
    name: string;
    images: string[];
}

@Injectable()
export class StoreService {
    async storeInfo(name: string, relativePaths: string[]): Promise<void> {
        const infoPath = `assets/data/gamesData.json`;
        const gameData: Data = { name, images: relativePaths };
        let gamesData: Data[] = [];
        const gamesContent = await fs.readFile(infoPath, `utf-8`);
        gamesData = JSON.parse(gamesContent);
        gamesData.push(gameData);
        await fs.writeFile(infoPath, JSON.stringify(gamesData, null, 4));
    }

    async storeImage(name: string, image: string): Promise<string> {
        const filePath = `assets/images/${name}.bmp`;
        const b64ImgData = image.replace(/^data:image\/\w+;base64,/, '');
        const bmp = Buffer.from(b64ImgData, 'base64');
        await fs.writeFile(filePath, bmp);
        return filePath;
    }

    async getAllNames(): Promise<string[]> {
        const infoPath = `assets/data/gamesData.json`;
        let gamesData: Data[] = [];

        try {
            const gamesContent = await fs.readFile(infoPath, 'utf-8');
            gamesData = JSON.parse(gamesContent);
        } catch (e) {
            console.error(e);
            return [];
        }

        return gamesData.map((game) => game.name);
    }
}
