import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { readFileSync } from 'fs';

@Controller('games')
export class GamecardsController {
    constructor() {}

    @Get('/all')
    @ApiOkResponse({
        description: 'Get all gamecards',
    })
    sendAllGamecards() {
        const file = readFileSync('./assets/data/gamesData.json');
        const data = JSON.parse(file.toString());
        return data;
    }
}
