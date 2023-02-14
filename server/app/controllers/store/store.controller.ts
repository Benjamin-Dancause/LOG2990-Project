import { StoreService } from '@app/services/store/store.service';
import { Body, Controller, Get, Header, HttpCode, Post } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

interface Coords {
    x: number;
    y: number;
}

@Controller('games')
export class StoreController {
    constructor(private readonly storeService: StoreService) {}

    @Post('/images')
    @Header('Content-Type', 'image/png')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({
        description: 'Store name and images on the server',
    })
    async storeData(
        @Body() data: { name: string; originalImage: string; modifiableImage: string; difficulty: boolean; count: number; differences: Coords[][] },
    ) {
        const { name, originalImage, modifiableImage, difficulty, count, differences } = data;
        const relativePaths = [];

        const origPath = await this.storeService.storeImage(name + '_orig', originalImage);
        relativePaths.push(origPath);
        const modifPath = await this.storeService.storeImage(name + '_modif', modifiableImage);
        relativePaths.push(modifPath);

        const testing = await this.storeService.getGameDifferenceByName('Langevin');
        console.log(testing);

        await this.storeService.storeInfo(name, relativePaths, difficulty, count, differences);
    }

    @Get('/names')
    @ApiOkResponse({
        description: 'Gets all the game names',
    })
    async getNames() {
        return this.storeService.getAllNames();
    }

    @Get('/allGames')
    @ApiOkResponse({
        description: 'gets all the game information for the game cards',
    })
    async getGameList() {
        return this.storeService.getAllGames();
    }

    @Post('gameByName')
    @ApiOkResponse({
        description: 'gets game information for a single game',
    })
    async getGameByName(@Body() body: { name: string }) {
        return this.storeService.getGameByName(body);
    }
}
