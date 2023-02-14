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
    id: number;
    diffCount: number;
    differences: Coords[][];
    
    constructor(gameData: GameDiffData) {
        this.id = gameData.id;
        this.diffCount = gameData.count;
        this.differences = gameData.differences;
    }
    async checkDifference(clickCoord: Coords): Promise<{ isDifference: boolean; differenceNumber: number; coords: Coords[] }> {
        for (const difference of this.differences) {
            for (const coord of difference) {
                if (coord.x === clickCoord.x && coord.y === clickCoord.y) {
                    const differenceNumber = this.differences.indexOf(difference) + 1;
                    const coords = this.differences[differenceNumber - 1];
                    this.differences.splice(differenceNumber - 1, 1);
                    return { isDifference: true, differenceNumber, coords };
                }
            }
        }
    }
}
export interface GameDiffData {
    id: number;
    count: number;
    differences: Coords[][];
}