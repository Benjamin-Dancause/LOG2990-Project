/* eslint-disable @typescript-eslint/no-explicit-any */
import { GameConfigService } from '@app/services/game-config/game-config.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('gameConfig')
export class GameConfigController {
    constructor(private readonly gameConfigService: GameConfigService) {}

    @Get('/constants/countdownTime')
    @ApiOkResponse({
        description: 'Get countdownTime',
    })
    async getCountdownTime() {
        return this.gameConfigService.getCountdownTime();
    }

    @Post('/constants/countdownTime')
    @ApiOkResponse({
        description: 'Set countdownTime',
    })
    setCountdownTime(@Body('time') countdownTime: number): void {
        this.gameConfigService.setCountdownTime(countdownTime);
    }

    @Get('/constants/penaltyTime')
    @ApiOkResponse({
        description: 'Get penaltyTime',
    })
    async getPenaltyTime() {
        return this.gameConfigService.getPenaltyTime();
    }

    @Post('/constants/penaltyTime')
    @ApiOkResponse({
        description: 'Set penaltyTime',
    })
    setPenaltyTime(@Body('time') penaltyTime: number): void {
        this.gameConfigService.setPenaltyTime(penaltyTime);
    }

    @Get('/constants/timeGained')
    @ApiOkResponse({
        description: 'Get timeGained',
    })
    async getTimeGained() {
        return this.gameConfigService.getTimeGained();
    }

    @Post('/constants/timeGained')
    @ApiOkResponse({
        description: 'Set timeGained',
    })
    setTimeGained(@Body('time') timeGained: number): void {
        this.gameConfigService.setTimeGained(timeGained);
    }
}
