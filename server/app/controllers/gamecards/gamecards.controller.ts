import { GamecardsService } from '@app/services/gamecards/gamecards.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Gamecards')
@Controller('gamecards')
export class GamecardsController {
    constructor(private gamecardsService: GamecardsService) {}

    @Post('/images')
    send(@Body() image: HTMLImageElement) {
        this.gamecardsService.storeImage(image);
    }
}
