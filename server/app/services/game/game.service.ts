import { Injectable } from '@nestjs/common';

interface Coords {
    x: number;
    y: number;
}

interface Game {
    name: string;
    differences: Coords[][];
}

@Injectable()
export class GameService {
    async checkDifference(clickCoord: Coords, game: Game): Promise<{ isDifference: boolean; differenceNumber: number; coords: Coords[] }> {
        for (const difference of game.differences) {
            for (const coord of difference) {
                if (coord.x === clickCoord.x && coord.y === clickCoord.y) {
                    const differenceNumber = game.differences.indexOf(difference) + 1;
                    const coords = game.differences[differenceNumber - 1];
                    game.differences.splice(differenceNumber - 1, 1);
                    return { isDifference: true, differenceNumber, coords };
                }
            }
        }
    }
}
