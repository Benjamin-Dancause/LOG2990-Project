import { DatabaseService } from '@app/services/database/database.service';
import { StoreService } from '@app/services/store/store.service';
import { Coords } from '@common/game-interfaces';
import { Body, Controller, Delete, Get, Header, HttpCode, Param, Post } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

@Controller('games')
export class StoreController {
    constructor(private readonly storeService: StoreService, private databaseService: DatabaseService) {}

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

    @Delete(':name')
    @ApiOkResponse({
        description: 'delete game from data',
    })
    async deleteGame(@Param('name') name: string) {
        await this.databaseService.deleteBestTimes(name);
        return this.storeService.deleteGame(name);
    }

    @Delete('/delete/games')
    @ApiOkResponse({
        description: 'delete all game from data',
    })
    async deleteAllGames() {
        return this.storeService.deleteAllGames();
    }

    @Get(':name')
    @ApiOkResponse({
        description: 'check game availability',
    })
    async getGameAvailability(@Param('name') name: string) {
        const isAvailable = await this.storeService.getGameAvailability(name);
        return isAvailable;
    }
}
