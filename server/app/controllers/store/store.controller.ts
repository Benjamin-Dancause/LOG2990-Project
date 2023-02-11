import { StoreService } from '@app/services/store/store.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('store')
export class StoreController {
    constructor(private readonly storeService: StoreService) {}

    @Post('/')
    @ApiOkResponse({
        description: 'Store name and images on the server',
    })
    async storeData(@Body() data: { name: string; images: string[] }) {
        const { name, images } = data;
        const relativePaths = [];

        for (const image of images) {
            const relativePath = await this.storeService.storeImage(name, image);
            relativePaths.push(relativePath);
        }

        await this.storeService.storeInfo(name, relativePaths);
    }
}
