import { promises as fs } from 'fs';
import { DifferenceInterface } from '../game/game.service';
import { StoreService } from '../store/store.service';

export interface Coords {
    x: number;
    y: number;
}
interface GameDiffData {
    id: number;
    count: number;
    differences: Coords[][];
}
export class GameManager {
    constructor(private storeService : StoreService) {}

    createGame(gameData: GameDiffData): number {
        return gameData.count;
    }
    // deleteGame(gameId: number): void {
    //     for (let i = 0; i < this.games.length; i++) {
    //         if (this.games[i].id === gameId) {
    //             this.games[i] = null;
    //             this.games.splice(i, 1);
    //         }
    //     }
    // }
    // async verifyPos(name: string, coords: Coords): Promise<DifferenceInterface> {
    //     return await this.checkDifference(name, coords);
    // }

    async verifyPos(name : string, clickCoord: Coords): Promise<DifferenceInterface> {
        const infoPath = `assets/data/gamesData.json`;
        const gamesContent = await fs.readFile(infoPath, 'utf-8').then((data) => JSON.parse(data));
        
        const differences = await gamesContent.find((game) => game.name === name).differences;
        
        for (const difference of differences) {
            for (const coord of difference) {
                if (coord.x === clickCoord.x && coord.y === clickCoord.y) {
                    const differenceNumber = differences.indexOf(difference) + 1;
                    const coords = differences[differenceNumber - 1];
                    differences.splice(differenceNumber - 1, 1);
                    return { isDifference: true, differenceNumber: differenceNumber, coords: coords };
                }
            }
        }
        return { isDifference: false, differenceNumber: 0, coords: [] };
    }
}
