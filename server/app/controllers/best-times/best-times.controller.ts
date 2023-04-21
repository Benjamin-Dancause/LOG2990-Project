import { DatabaseService } from '@app/services/database/database.service';
import { BestTimes, PlayerTime } from '@common/game-interfaces';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('best-times')
export class BestTimesController {
    constructor(private readonly databaseService: DatabaseService) {}

    @Get('/all')
    @ApiOkResponse({
        description: 'Get the best times for all games',
    })
    async getAllTimes(): Promise<BestTimes[]> {
        return this.databaseService.getBestTimes();
    }

    @Get('/:gameTitle/:gameMode')
    @ApiOkResponse({
        description: 'Get the best times for a game',
    })
    async getTimes(@Param('gameTitle') gameTitle: string, @Param('gameMode') gameMode: string): Promise<number[]> {
        return this.databaseService.getBestTimesByName(gameTitle, gameMode);
    }
    @Post('/reset')
    @ApiOkResponse({
        description: 'Reset the best times for all games',
    })
    resetAllBestTimes(): void {
        this.databaseService.setup();
    }
    @Post('/:gameTitle')
    @ApiOkResponse({
        description: 'Update the best times for a game',
    })
    updateTimes(@Param('gameTitle') gameTitle: string, @Body() playerTime: PlayerTime): void {
        this.databaseService.updateBestTimes(gameTitle, playerTime.isSolo, playerTime.user, playerTime.time);
    }
    @Delete('/:gameTitle')
    @ApiOkResponse({
        description: 'Delete the best times for a game',
    })
    deleteTimes(@Param('gameTitle') gameTitle: string): void {
        this.databaseService.deleteBestTimes(gameTitle);
    }

    @Post('/reset/:gameTitle')
    @ApiOkResponse({
        description: 'Reset the best times for a game',
    })
    resetBestTimes(@Param('gameTitle') gameTitle: string): void {
        this.databaseService.resetBestTimes(gameTitle);
    }
}
