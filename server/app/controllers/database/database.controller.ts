import { databaseService } from '@app/services/database/database.service';
import { bestTimes, playerTime } from '@common/game-interfaces';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
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
    @Post('/reset')
    @ApiOkResponse({
        description: 'Reset the best times for all games',
    })
    resetAllBestTimes(): void{
        this.databaseService.setup();
    }
    @Post('/:gameTitle')
    @ApiOkResponse({
        description: 'Update the best times for a game',
    })
    updateTimes(@Param('gameTitle') gameTitle: string, @Body() playerTime : playerTime): void{
        this.databaseService.updateBestTimes(gameTitle, playerTime.isSolo, playerTime.user, playerTime.time);
    }
    @Delete('/:gameTitle')
    @ApiOkResponse({
        description: 'Delete the best times for a game',
    })
    deleteTimes(@Param('gameTitle') gameTitle: string): void{
        this.databaseService.deleteBestTimes(gameTitle);
    }

    @Post('/reset/:gameTitle')
    @ApiOkResponse({
        description: 'Reset the best times for a game',
    })
    resetBestTimes(@Param('gameTitle') gameTitle: string): void{
        this.databaseService.resetBestTimes(gameTitle);
    }

}
