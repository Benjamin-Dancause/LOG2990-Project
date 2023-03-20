import { ClassicModeGateway } from '@app/gateways/timer/classic-mode.gateway';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TimerManagerService } from './timer-manager.service';

describe('TimerManagerService', () => {
    let service: TimerManagerService;
    let app: INestApplication;
    let timerGateway: ClassicModeGateway;

    beforeEach(async () => {
        jest.useFakeTimers();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TimerManagerService,
                {
                    provide: ClassicModeGateway,
                    useFactory: () => ({
                        emitTimeToRoom: jest.fn(),
                    }),
                },
            ],
        }).compile();

        service = module.get<TimerManagerService>(TimerManagerService);
        timerGateway = module.get<ClassicModeGateway>(ClassicModeGateway);

        app = module.createNestApplication();
        await app.init();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    afterEach(async () => {
        jest.clearAllTimers();
        await app.close();
    });

    describe('startTimer', () => {
        it('should start a timer for a room', () => {
            service.startTimer('testRoom');
            expect(service.getTimeFromRoom('testRoom')).toEqual(0);
        });

        it('should not start a timer for a room that already has one timer', () => {
            service.startTimer('testRoom');
            const intervalId = service['intervals'].get('testRoom');
            service.startTimer('testRoom');
            expect(service['intervals'].get('testRoom')).toEqual(intervalId);
        });
    });

    describe('updateTimer', () => {
        it('should increment the time and emit to the room', () => {
            service['timers'].set('testRoom', 0);
            service.updateTimer('testRoom');
            expect(timerGateway.emitTimeToRoom).toHaveBeenCalledWith('testRoom', 1);
            expect(service['timers'].get('testRoom')).toEqual(1);
        });
    });

    describe('deleteTimerData', () => {
        it('should delete the timer data for a room', () => {
            service['timers'].set('testRoom', 0);
            // const intervalId = service['intervals'].get('testRoom');
            service.deleteTimerData('testRoom');
            expect(service['intervals'].has('testRoom')).toBeFalsy();
            expect(service['timers'].has('testRoom')).toBeFalsy();
            // expect(clearInterval).toHaveBeenCalledWith(intervalId);
        });
    });

    describe('resetTimer', () => {
        it('should reset the timer for a room', () => {
            const TIME = 10;
            service['timers'].set('testRoom', TIME);
            // const intervalId = service['intervals'].get('testRoom');
            service.resetTimer('testRoom');
            // expect(service['timers'].get('testRoom')).toEqual(0);
            expect(service['intervals'].has('testRoom')).toBeFalsy();
            // expect(clearInterval).toHaveBeenCalledWith(intervalId);
        });
    });

    describe('setInterval', () => {
        it('should call updateTimer function every 1000ms', () => {
            const updateTimerSpy = jest.spyOn(service, 'updateTimer');
            service.startTimer('testRoom');
            jest.advanceTimersByTime(5000);
            expect(updateTimerSpy).toHaveBeenCalledTimes(5);
        });
    });
});
