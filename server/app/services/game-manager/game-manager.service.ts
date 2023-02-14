import { GameService } from "../game/game.service";

interface Coords {
    x: number;
    y: number;
}
interface GameDiffData {
    id: number;
    count: number;
    differences: Coords[][];
}

export class GameManager {
    games: GameService[];
    gamesId: number;
    constructor() {
        this.games = [];
        this.gamesId= 0;
    }

    createGame(gameData: GameDiffData): number{
        gameData.id = ++this.gamesId;
        const game = new GameService(gameData);
        this.games.push(game);
        return gameData.id;
    }
    deleteGame(gameId: number): void {
        for(let i = 0; i < this.games.length; i++){
            if(this.games[i].id === gameId){
                this.games[i] = null;
                this.games.splice(i, 1);
            }

        }
    }
    async verifyPos(id: number, coords: Coords): Promise<{isDifference: boolean, differenceNumber: number, coords: Coords[]}> {

        for(let i = 0; i < this.games.length; i++){
            if(this.games[i].id === id){
                return this.games[i].checkDifference(coords);
            }

        }
    }

}