import { Test } from '@nestjs/testing';
import { DatabaseController } from './database.controller';

describe('DatabaseController', () => {
    let gameController: DatabaseController;

    beforeEach(async () => {
        const app = await Test.createTestingModule({
            controllers: [DatabaseController],
        }).compile();

        gameController = app.get<DatabaseController>(DatabaseController);
    });


});
