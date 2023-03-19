import { Test, TestingModule } from '@nestjs/testing';
import { ClassicModeGateway } from './classic-mode.gateway';

describe('ClassicModeGateway', () => {
    let gateway: ClassicModeGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ClassicModeGateway],
        }).compile();

        gateway = module.get<ClassicModeGateway>(ClassicModeGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
