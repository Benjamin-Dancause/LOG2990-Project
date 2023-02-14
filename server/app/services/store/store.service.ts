import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';

interface Coords {
    x: number;
    y: number;
}

interface Data {
    name: string;
    images: string[];
    difficulty: boolean;
    count: number;
    differences: Coords[][];
}

@Injectable()
export class StoreService {
    async storeInfo(name: string, relativePaths: string[], difficulty: boolean, count: number, differences: Coords[][]): Promise<void> {
        const infoPath = 'assets/data/gamesData.json';
        const gameData: Data = { name, images: relativePaths, difficulty, count, differences };
        let gamesData: Data[] = [];
        const gamesContent = await fs.readFile(infoPath, 'utf-8');
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
        const infoPath = 'assets/data/gamesData.json';
        let gamesData: Data[] = [];

        const gamesContent = await fs.readFile(infoPath, 'utf-8');
        gamesData = JSON.parse(gamesContent);

        return gamesData.map((game) => game.name);
    }
}
