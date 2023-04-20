import { Coords, DifferenceInterface, GameDiffData, RoomGameData } from '@common/game-interfaces';
import { promises as fs } from 'fs';
// eslint-disable-next-line no-restricted-imports
import { StoreService } from '../store/store.service';

export class GameManager {
    roomIdToGameDifferences = new Map<string, RoomGameData[]>();

    constructor(private storeService: StoreService) {}

    createGame(gameData: GameDiffData): number {
        if (gameData) {
            return gameData.count;
        }
        return 0;
    }

    async loadGame(roomId: string, gameTitles: string[]): Promise<{ images: string[]; title: string }> {
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
                    return { isDifference: true, differenceNumber, coords };
                }
            }
        }
        return { isDifference: false, differenceNumber: 0, coords: [] };
    }
    switchGame(roomId: string): { length: number; images: string[]; title: string } {
        const remainingGames: number = this.switchData(roomId);
        if (remainingGames > 0) {
            const newImages: { images: string[]; title: string } = this.switchImages(roomId);
            const switchGameInfo = { length: remainingGames, images: newImages.images, title: newImages.title };
            return switchGameInfo;
        } else {
            return { length: remainingGames, images: [], title: '' };
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

    switchImages(roomId: string): { images: string[]; title: string } {
        const currentGame = this.roomIdToGameDifferences.get(roomId)[0];
        return { images: currentGame.images, title: currentGame.name };
    }

    deleteRoomGameInfo(roomId: string) {
        this.roomIdToGameDifferences.delete(roomId);
    }

    getAllRooms(): IterableIterator<string> {
        const keys: IterableIterator<string> = this.roomIdToGameDifferences.keys();
        return keys;
    }

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
