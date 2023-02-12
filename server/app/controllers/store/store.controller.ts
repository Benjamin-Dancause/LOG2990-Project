import { StoreService } from '@app/services/store/store.service';
import { Body, Controller, Get, Header, HttpCode, Post } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

@Controller('games')
export class StoreController {
    constructor(private readonly storeService: StoreService) {}

    @Post('/images')
    @Header('Content-Type', 'image/png')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({
        description: 'Store name and images on the server',
    })
    async storeData(@Body() data: { name: string; originalImage: string; modifiableImage: string }) {
        // modifImg: string
        const { name, originalImage, modifiableImage } = data;
        const relativePaths = [];

        //console.log(originalImage);

        const origPath = await this.storeService.storeImage(name + '_orig', originalImage);
        relativePaths.push(origPath);
        const modifPath = await this.storeService.storeImage(name + '_modif', modifiableImage);
        relativePaths.push(modifPath);

        await this.storeService.storeInfo(name, relativePaths);
    }

    @Get('/images')
    @ApiOkResponse({
        description: 'test',
    })
    async test() {
        console.log('test');
    }
}
