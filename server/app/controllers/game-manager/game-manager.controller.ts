import { GameManager } from '@app/services/game-manager/game-manager.service';
import { StoreService } from '@app/services/store/store.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('gaming')
export class GameManagerController {
    constructor(private storeService: StoreService, private gameManager: GameManager) {}

    @Post('/findAll')
    @ApiOkResponse({
        description: 'Get all differences',
    })
    async returnAllDiff(@Body() body: { name: string }) {
        return await this.gameManager.getAllDifferences(body.name);
    }

    @Post('/diffAmount')
    @ApiOkResponse({
        description: 'New game',
    })
    async sendDiffAmount(@Body() body: { name: string }) {
        return this.gameManager.createGame(await this.storeService.getGameDifferenceByName(body.name));
    }
}
