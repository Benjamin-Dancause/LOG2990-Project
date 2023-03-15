import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

@Controller('gameCards')
export class GameController {
    private games = new Map<string, string[]>(); // key: gameTitle, value: list of usernames

    @Post(':gameTitle/players')
    addPlayer(@Param('gameTitle') gameTitle: string, @Body('userName') userName: string): void {
        const players = this.games.get(gameTitle) || [];
        players.push(userName);
        this.games.set(gameTitle, players);
    }

    @Delete(':gameTitle/players/:userName')
    removePlayer(@Param('gameTitle') gameTitle: string, @Param('userName') userName: string): void {
        const players = this.games.get(gameTitle) || [];
        const index = players.findIndex((player) => player === userName);
        if (index !== -1) {
            players.splice(index, 1);
            this.games.set(gameTitle, players);
        }
    }

    @Get(':gameTitle/players')
    getPlayers(@Param('gameTitle') gameTitle: string): string[] {
        return this.games.get(gameTitle) || [];
    }
}
