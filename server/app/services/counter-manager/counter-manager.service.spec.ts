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

    describe('startCounter', () => {
        it('should set the counter for a given roomId', () => {
            const roomId = 'test-room';
            service.startCounter(roomId);
            const counter = service.getCounterFromRoom(roomId);
            expect(counter).toBe(0);
        });
    });

    describe('deleteCounterData', () => {
        it('should delete the counter data for a given roomId', () => {
            const roomId = 'test-room';
            service.startCounter(roomId);
            service.deleteCounterData(roomId);
            const counter = service.getCounterFromRoom(roomId);
            expect(counter).toBe(0);
        });
    });

    describe('getCounterFromRoom', () => {
        it('should return the counter for a given roomId', () => {
            const roomId = 'test-room';
            service.startCounter(roomId);
            const counter = service.getCounterFromRoom(roomId);
            expect(counter).toBe(0);
        });
    });

    describe('incrementCounter', () => {
        it('should increment the counter for a given roomId', () => {
            const roomId = 'test-room';
            service.startCounter(roomId);
            const counter = service.incrementCounter(roomId);
            expect(counter).toBe(1);
        });
    });

    describe('resetCounter', () => {
        it('should reset the counter for a given roomId', () => {
            const roomId = 'test-room';
            service.startCounter(roomId);
            service.incrementCounter(roomId);
            const counter = service.resetCounter(roomId);
            expect(counter).toBe(0);
        });
    });

    describe('isInitializedCounter', () => {
        it('should return false if the counter has not been initialized for the given roomId', () => {
            const roomId = 'testRoomId';
            expect(service.isInitializedCounter(roomId)).toBe(false);
        });

        it('should return true if the counter has been initialized for the given roomId', () => {
            const roomId = 'testRoomId';
            service.startCounter(roomId);
            expect(service.isInitializedCounter(roomId)).toBe(true);
        });
    });
});
