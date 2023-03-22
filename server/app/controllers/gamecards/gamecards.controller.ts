import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { readFileSync } from 'fs';

@Controller('games')
export class GamecardsController {
    @Get('/all')
    @ApiOkResponse({
        description: 'Get all gamecards',
    })
    sendAllGamecards() {
        const file = readFileSync('./assets/data/gamesData.json');
        const data = JSON.parse(file.toString());
        const dataNoDiff = data.map((game) => {
            return { name: game.name, image: game.images[0], difficulty: game.difficulty };
        });
        return dataNoDiff;
    }
}
