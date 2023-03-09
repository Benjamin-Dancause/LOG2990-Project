import { Test, TestingModule } from '@nestjs/testing';
import { CounterGateway } from './counter.gateway';

describe('CounterGateway', () => {
  let gateway: CounterGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CounterGateway],
    }).compile();

    gateway = module.get<CounterGateway>(CounterGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
