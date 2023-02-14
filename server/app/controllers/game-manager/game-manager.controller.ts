import { GameManager } from '@app/services/game-manager/game-manager.service';
import { StoreService } from '@app/services/store/store.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

interface Coords {
    x: number;
    y: number;
}

@Controller('gaming')
export class GameManagerController {
    constructor(private storeService: StoreService, private gameManager: GameManager) {}
    @Post('/find')
    @ApiOkResponse({
        description: 'Position of click',
    })
    async checkPos(@Body() body: { name: string; coords: Coords }) {
        return await this.gameManager.verifyPos(body.name, body.coords);
        // return { isDifference: false, differenceNumber: 1, coords: [{ x: 1, y: 1 }] };
    }

    @Post('/diffAmount')
    @ApiOkResponse({
        description: 'New game',
    })
    async sendDiffAmount(@Body() body: { name: string }) {
        return this.gameManager.createGame(await this.storeService.getGameDifferenceByName(body.name));
    }
}
