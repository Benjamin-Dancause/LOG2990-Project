import { Test, TestingModule } from '@nestjs/testing';
import { databaseService } from './database.service';

describe('DatabaseService', () => {
    let service: databaseService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [databaseService],
        }).compile();

        service = module.get<databaseService>(databaseService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    
});
