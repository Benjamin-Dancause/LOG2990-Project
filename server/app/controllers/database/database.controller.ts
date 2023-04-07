import { databaseService } from '@app/services/database/database.service';
import { bestTimes } from '@common/game-interfaces';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('database')
export class DatabaseController {
    constructor(private readonly databaseService: databaseService) {}

    @Get('/all')
    @ApiOkResponse({
        description: 'Get the best times for all games',
    })
    getAllTimes(): Promise<bestTimes[]>{
        return this.databaseService.getBestTimes();
    }

    @Get('/:gameTitle')
    @ApiOkResponse({
        description: 'Get the best times for a game',
    })
    getTimes(@Param('gameTitle') gameTitle: string): Promise<bestTimes>{
        return this.databaseService.getBestTimesByName(gameTitle);
    }

    @Post('/:gameTitle')
    @ApiOkResponse({
        description: 'Update the best times for a game',
    })
    updateTimes(@Param('gameTitle') gameTitle: string, @Body() newBestTime: bestTimes): void{
        this.databaseService.updateBestTimes(gameTitle, newBestTime);
    }
    
}
