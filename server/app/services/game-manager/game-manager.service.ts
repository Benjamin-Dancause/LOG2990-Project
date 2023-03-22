import { Coords, DifferenceInterface, GameDiffData } from '@common/game-interfaces';
import { promises as fs } from 'fs';
// eslint-disable-next-line no-restricted-imports
import { StoreService } from '../store/store.service';

export class GameManager {
    constructor(private storeService: StoreService) {}

    createGame(gameData: GameDiffData): number {
        return gameData.count;
    }

    async verifyPos(name: string, clickCoord: Coords): Promise<DifferenceInterface> {
        const infoPath = 'assets/data/gamesData.json';
        const gamesContent = await fs.readFile(infoPath, 'utf-8').then((data) => JSON.parse(data));

        const differences = await gamesContent.find((game) => game.name === name).differences;

        for (const difference of differences) {
            for (const coord of difference) {
                if (coord.x === clickCoord.x && coord.y === clickCoord.y) {
                    const differenceNumber = differences.indexOf(difference) + 1;
                    const coords = differences[differenceNumber - 1];
                    differences.splice(differenceNumber - 1, 1);
                    return { isDifference: true, differenceNumber, coords };
                }
            }
        }
        return { isDifference: false, differenceNumber: 0, coords: [] };
    }

    async getAllDifferences(name: string): Promise<GameDiffData> {
        const infoPath = 'assets/data/gamesData.json';
        const gamesContent = await fs.readFile(infoPath, 'utf-8').then((data) => JSON.parse(data));

        // eslint-disable-next-line @typescript-eslint/no-shadow
        const game = await gamesContent.find((game) => game.name === name);

        return { id: game.id, count: game.count, differences: game.differences };
    }
}
