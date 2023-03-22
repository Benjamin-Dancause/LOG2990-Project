/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Coords, Data, GameDiffData, GameplayData, GameSelectionPageData } from '@common/game-interfaces';
import { Body, Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { promisify } from 'util';

@Injectable()
export class StoreService {
    // eslint-disable-next-line max-params
    async storeInfo(name: string, relativePaths: string[], difficulty: boolean, count: number, differences: Coords[][]): Promise<void> {
        const infoPath = 'assets/data/gamesData.json';
        const gamesData: Data[] = await this.extractData();
        const gameData: Data = {
            name,
            images: relativePaths,
            difficulty,
            count,
            differences,
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
        const gamesData: Data[] = await this.extractData();
        return gamesData.map((game) => game.name);
    }

    async getAllGames(): Promise<GameSelectionPageData[]> {
        const gamesData: Data[] = await this.extractData();
        return gamesData.map((game) => ({
            name: game.name,
            image: game.images[0],
            difficulty: game.difficulty,
        }));
    }
    /*
    async getAllGames(): Promise<GameSelectionPageData[]> {
        const gamesData: Data[] = await this.extractData();
        if (!gamesData) {
            throw new Error('No games data found');
        }
        return gamesData.map((game) => ({
            name: game.name,
            image: game.images[0],
            difficulty: game.difficulty,
            count: game.count,
            differences: game.differences,
        }));
    }
    */

    async getGameByName(@Body() body: { name: string }): Promise<GameplayData> {
        const gamesData: Data[] = await this.extractData();
        const name = body.name;
        const game = gamesData.find((game) => game.name === name);
        if (game) {
            return { name: game.name, images: game.images, difficulty: game.difficulty, count: game.count };
        }
        return undefined;
    }

    async getGameDifferenceByName(name: string): Promise<GameDiffData> {
        const gamesData: Data[] = await this.extractData();
        const game = gamesData.find((game) => game.name === name);

        if (game) {
            return { id: 0, count: game.count, differences: game.differences };
        }
        return undefined;
    }

    async extractData(): Promise<Data[]> {
        const infoPath = 'assets/data/gamesData.json';
        const gamesContent = await fs.readFile(infoPath, 'utf-8');
        return JSON.parse(gamesContent);
    }

    async deleteGame(name: string): Promise<void> {
        const infoPath = 'assets/data/gamesData.json';
        const gamesData: Data[] = await this.extractData();
        const index = gamesData.findIndex((game) => game.name === name);
        if (index !== -1) {
            gamesData.splice(index, 1);
            const filePath1 = `assets/images/${name}_modif.bmp`;
            const filePath2 = `assets/images/${name}_orig.bmp`;
            this.deleteFile(filePath1);
            this.deleteFile(filePath2);
            await fs.writeFile(infoPath, JSON.stringify(gamesData, null, 4));
        }
    }

    async getGameAvailability(name: string): Promise<boolean> {
        const gamesData: Data[] = await this.extractData();
        const index = gamesData.findIndex((game) => game.name === name);
        if (index === -1) {
            return false;
        } else {
            return true;
        }
    }

    async deleteFile(filePath: string): Promise<void> {
        try {
            await promisify(fs.unlink)(filePath);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Error deleting file: ${error}`);
        }
    }
}
