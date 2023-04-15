import { Test } from '@nestjs/testing';
import { BestTimesController } from './best-times.controller';

describe('BestTimesController', () => {
    let gameController: BestTimesController;

    beforeEach(async () => {
        const app = await Test.createTestingModule({
            controllers: [BestTimesController],
        }).compile();

        gameController = app.get<BestTimesController>(BestTimesController);
    });


});
