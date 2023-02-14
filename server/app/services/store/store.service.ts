import { Body, Injectable } from '@nestjs/common';
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

export interface GameSelectionPageData {
    name: string;
    image: string;
    difficulty: boolean;
}

export interface GameplayData {
    name: string;
    images: string[];
    count: number;
    difficulty: boolean;
}

export interface GameDiffData {
    id: number;
    count: number;
    differences: Coords[][];
}

@Injectable()
export class StoreService {
    async storeInfo(name: string, relativePaths: string[], difficulty: boolean, count: number, differences: Coords[][]): Promise<void> {
        const infoPath = `assets/data/gamesData.json`;
        let gamesData: Data[] = await this.extractData();
        const gameData: Data = {
            name: name,
            images: relativePaths,
            difficulty: difficulty,
            count: count,
            differences: differences,
        };
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
        let gamesData: Data[] = await this.extractData();
        return gamesData.map((game) => game.name);
    }

    async getAllGames(): Promise<GameSelectionPageData[]> {
        let gamesData: Data[] = await this.extractData();
        return gamesData.map((game) => ({
            name: game.name,
            image: game.images[0],
            difficulty: game.difficulty,
        }));
    }

    async getGameByName(@Body() body: { name: string }): Promise<GameplayData> {
        let gamesData: Data[] = await this.extractData();
        const name = body.name;
        const game = gamesData.find((game) => game.name === name);
        if (game) {
            return { name: game.name, images: game.images, difficulty: game.difficulty, count: game.count };
        }
        return undefined;
    }

    async getGameDifferenceByName(name: string): Promise<GameDiffData> {
        let gamesData: Data[] = await this.extractData();
        const game = gamesData.find((game) => game.name === name);

        if (!game) {
            return undefined;
        }

        return { id: 0, count: game.count, differences: game.differences };
    }

    async extractData(): Promise<Data[]> {
        const infoPath = `assets/data/gamesData.json`;
        const gamesContent = await fs.readFile(infoPath, 'utf-8');
        return JSON.parse(gamesContent);
    }
}
