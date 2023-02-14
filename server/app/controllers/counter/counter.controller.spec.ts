import { Test, TestingModule } from '@nestjs/testing';
import { CounterController } from './counter.controller';

describe('CounterController', () => {
    let controller: CounterController;
    const _counter = 0;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CounterController],
        }).compile();

        controller = module.get<CounterController>(CounterController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getCounter() should return counter value', () => {
        expect(controller.getCounter()).toEqual(0);
    });

    it('incrementCounter() should increment the counter', () => {
        const body = {};
        const firstRes = controller.incrementCounter(body);
        expect(firstRes).toEqual(1);
        const secondRes = controller.incrementCounter(body);
        expect(secondRes).toEqual(2);
    });

    it('resetCounter() should set counter to 0', () => {
        const body = {};
        const response = controller.resetCounter(body);
        expect(response).toEqual(0);
    });
});
