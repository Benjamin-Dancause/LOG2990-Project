import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { readFileSync } from 'fs';


    @Get('/all')
    @ApiOkResponse({
        description: 'Get all gamecards',
    })
    sendAllGamecards() {
        const file = readFileSync('./games/games.json');
        const data = JSON.parse(file.toString());
        return data;
    }
}
