import { Controller, Get } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Images')
@Controller('images')
export class GamecardsController {
    constructor() {}

    @ApiCreatedResponse({
        description: 'Image created successfully',
    })
    @Get('/')
    @ApiOkResponse({
        description: 'Get all images',
    })
    test() {
        return { name: 'hello' };
    }
}
