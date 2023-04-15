import { databaseService } from '@app/services/database/database.service';
import { gameHistoryInfo } from '@common/game-interfaces';
import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('history')
export class GameHistoryController {
    constructor(private readonly databaseService: databaseService) {}


    @Get('/All')
    @ApiOkResponse({
        description: 'Get the game history for a game',
    })
    getAllHistory(): Promise<gameHistoryInfo[]>{
        return this.databaseService.getAllGameHistory();
    }
    @Get('/:gameTitle')
    @ApiOkResponse({
        description: 'Get the game history for a game',
    })
    getHistory(@Param('gameTitle') gameTitle: string): Promise<gameHistoryInfo[]>{
        return this.databaseService.getGameHistory(gameTitle);
    }
    @Put('')
    @ApiOkResponse({
        description: 'Update the game history for a game',
    })
    createGameHistory(@Body() gameHistoryInfo : gameHistoryInfo): void{
        this.databaseService.createGameHistory(gameHistoryInfo);
    }
    @Delete('')
    @ApiOkResponse({
        description: 'Delete the game history for all games',
    })
    deleteHistory(): void{
        this.databaseService.deleteAllGameHistory();
    }
}
