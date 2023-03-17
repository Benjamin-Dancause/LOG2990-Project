import { Test, TestingModule } from '@nestjs/testing';
import { CounterManagerService } from './counter-manager.service';

describe('CounterManagerService', () => {
  let service: CounterManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CounterManagerService],
    }).compile();

    service = module.get<CounterManagerService>(CounterManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
