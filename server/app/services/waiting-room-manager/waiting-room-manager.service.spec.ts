import { Test, TestingModule } from '@nestjs/testing';
import { WaitingRoomManagerService } from './waiting-room-manager.service';

describe('WaitingRoomManagerService', () => {
  let service: WaitingRoomManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaitingRoomManagerService],
    }).compile();

    service = module.get<WaitingRoomManagerService>(WaitingRoomManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
