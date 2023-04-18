import { Coords, DifferenceInterface, GameDiffData, RoomGameData } from '@common/game-interfaces';
import { promises as fs } from 'fs';
// eslint-disable-next-line no-restricted-imports
import { StoreService } from '../store/store.service';

export class GameManager {
    constructor(private storeService: StoreService) {}

    roomIdToGameDifferences = new Map<string, RoomGameData[]>();

    createGame(gameData: GameDiffData): number {
        if (gameData) {
            return gameData.count;
        }
        return 0;
    }

    async loadGame(roomId: string, gameTitles: string[]): Promise<string[]> {
        const infoPath = 'assets/data/gamesData.json';
        const allGames = await fs.readFile(infoPath, 'utf-8').then((data) => JSON.parse(data));
        const games: RoomGameData[] = [];
        for (const title of gameTitles) {
            const currentGameData = await allGames.find((game) => game.name === title);
            const roomGameData: RoomGameData = {
                name: currentGameData.name,
                count: currentGameData.count,
                differences: currentGameData.differences,
                images: currentGameData.images,
            };
            games.push(roomGameData);
        }
        const rooms = this.getAllRooms();
        for (const room of rooms) {
            if (room === roomId) {
                return this.switchImages(roomId);
            }
        }
        this.roomIdToGameDifferences.set(roomId, games);

        return this.switchImages(roomId);
    }

    verifyPosition(roomId: string, clickCoord: Coords): DifferenceInterface {
        const games = this.roomIdToGameDifferences.get(roomId);
        const differences = games[0].differences;
        for (const difference of differences) {
            for (const coord of difference) {
                if (coord.x === clickCoord.x && coord.y === clickCoord.y) {
                    const differenceNumber = differences.indexOf(difference) + 1;
                    const coords = differences[differenceNumber - 1];
                    // differences.splice(differenceNumber - 1, 1);
                    return { isDifference: true, differenceNumber, coords };
                }
            }
        }
        return { isDifference: false, differenceNumber: 0, coords: [] };
    }
    switchGame(roomId: string): { length: number; newImages: string[] } {
        const remainingGames: number = this.switchData(roomId);
        if (remainingGames > 0) {
            const newImages: string[] = this.switchImages(roomId);
            const switchGameInfo = { length: remainingGames, newImages };
            return switchGameInfo;
        } else {
            return { length: remainingGames, newImages: [] };
        }
    }

    switchData(roomId: string): number {
        const currentGames = this.roomIdToGameDifferences.get(roomId);
        if (currentGames.length > 0) {
            currentGames.splice(0, 1);
        }
        this.roomIdToGameDifferences.set(roomId, currentGames);
        return currentGames.length;
    }

    switchImages(roomId: string): string[] {
        const currentGame = this.roomIdToGameDifferences.get(roomId)[0];
        return currentGame.images;
    }

    deleteRoomGameInfo(roomId: string) {
        this.roomIdToGameDifferences.delete(roomId);
    }

    getAllRooms(): IterableIterator<string> {
        const keys: IterableIterator<string> = this.roomIdToGameDifferences.keys();
        return keys;
    }

    // async verifyPos(name: string, clickCoord: Coords): Promise<DifferenceInterface> {
    //     const infoPath = 'assets/data/gamesData.json';
    //     const gamesContent = await fs.readFile(infoPath, 'utf-8').then((data) => JSON.parse(data));

    //     const differences = await gamesContent.find((game) => game.name === name).differences;

    //     for (const difference of differences) {
    //         for (const coord of difference) {
    //             if (coord.x === clickCoord.x && coord.y === clickCoord.y) {
    //                 const differenceNumber = differences.indexOf(difference) + 1;
    //                 const coords = differences[differenceNumber - 1];
    //                 differences.splice(differenceNumber - 1, 1);
    //                 return { isDifference: true, differenceNumber, coords };
    //             }
    //         }
    //     }
    //     return { isDifference: false, differenceNumber: 0, coords: [] };
    // }

    async getAllDifferences(name: string): Promise<GameDiffData> {
        const infoPath = 'assets/data/gamesData.json';
        const gamesContent = await fs.readFile(infoPath, 'utf-8').then((data) => JSON.parse(data));

        // eslint-disable-next-line @typescript-eslint/no-shadow
        const game = await gamesContent.find((game) => game.name === name);
        if (game) {
            return { id: 0, count: game.count, differences: game.differences };
        }
        return { id: 0, count: 0, differences: [] };
    }
}
