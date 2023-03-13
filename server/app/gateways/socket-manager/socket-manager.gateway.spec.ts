import { Test, TestingModule } from '@nestjs/testing';
import { SocketManagerGateway } from './socket-manager.gateway';

describe('SocketManagerGateway', () => {
  let gateway: SocketManagerGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketManagerGateway],
    }).compile();

    gateway = module.get<SocketManagerGateway>(SocketManagerGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
