import { Controller, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('games')
export class GamecardsController {
    constructor() {}

    @Post('/')
    @ApiOkResponse({
        description: 'Get all images',
    })
    test() {
        return { name: 'hello' };
    }
}
