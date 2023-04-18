import { ClassicModeGateway } from '@app/gateways/classic-mode/classic-mode.gateway';
import { DELAY } from '@common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { TimerManagerService } from './timer-manager.service';

describe('TimerManagerService', () => {
    let service: TimerManagerService;
    let classicModeGateway: ClassicModeGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TimerManagerService,
                {
                    provide: ClassicModeGateway,
                    useValue: {
                        emitTimeToRoom: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<TimerManagerService>(TimerManagerService);
        classicModeGateway = module.get<ClassicModeGateway>(ClassicModeGateway);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('start timer should start a timer with the correct delay', () => {
        const roomId = 'test-room';
        const gameMode = 'tl';

        jest.useFakeTimers();

        service.startTimer(roomId, gameMode);

        jest.advanceTimersByTime(DELAY.SMALLTIMEOUT * 2);

        expect(classicModeGateway.emitTimeToRoom).toHaveBeenCalledTimes(2);
        expect(classicModeGateway.emitTimeToRoom).toHaveBeenCalledWith(roomId, expect.any(Number));
    });

    it('should decrement the timer if game mode is tl', () => {
        const roomId = 'test-room';
        const gameMode = 'tl';
        const initialTime = 60;

        service.startTimer(roomId, gameMode);
        service.updateTimer(roomId, gameMode);

        expect(service.getTimeFromRoom(roomId, gameMode)).toEqual(initialTime - 1);
        expect(classicModeGateway.emitTimeToRoom).toHaveBeenCalledTimes(1);
        expect(classicModeGateway.emitTimeToRoom).toHaveBeenCalledWith(roomId, initialTime - 1);
    });

    it('should not decrement the timer if game mode is not tl', () => {
        const roomId = 'test-room';
        const gameMode = '';
        const initialTime = 60;

        service.startTimer(roomId, gameMode);
        service.updateTimer(roomId, gameMode);

        expect(service.getTimeFromRoom(roomId, gameMode)).not.toEqual(initialTime - 1);
        expect(classicModeGateway.emitTimeToRoom).toHaveBeenCalledTimes(1);
        expect(classicModeGateway.emitTimeToRoom).not.toHaveBeenCalledWith(roomId, initialTime - 1);
    });

    it('addToTimer should add increment to the timer and emit the new timer value if it is less than 120', () => {
        const roomId = 'test-room';
        const increment = 10;

        service.timers.set(roomId, 50);
        service.addToTimer(roomId, increment);

        expect(service.timers.get(roomId)).toEqual(60);
        expect(classicModeGateway.emitTimeToRoom).toHaveBeenCalledTimes(1);
        expect(classicModeGateway.emitTimeToRoom).toHaveBeenCalledWith(roomId, 60);
    });

    it('addToTimer should set the timer to 120 and emit the new timer value if it exceeds 120', () => {
        const roomId = 'test-room';
        const increment = 100;

        service.timers.set(roomId, 50);
        service.addToTimer(roomId, increment);

        expect(service.timers.get(roomId)).toEqual(120);
        expect(classicModeGateway.emitTimeToRoom).toHaveBeenCalledTimes(1);
        expect(classicModeGateway.emitTimeToRoom).toHaveBeenCalledWith(roomId, 120);
    });

    it('removeToTimer should subtract decrement from the timer and emit the new timer value if it is greater than 0', () => {
        const roomId = 'test-room';
        const decrement = 10;

        service.timers.set(roomId, 50);
        service.removeToTimer(roomId, decrement);

        expect(service.timers.get(roomId)).toEqual(40);
        expect(classicModeGateway.emitTimeToRoom).toHaveBeenCalledTimes(1);
        expect(classicModeGateway.emitTimeToRoom).toHaveBeenCalledWith(roomId, 40);
    });

    it('removeToTimer should set the timer to 0 and emit the new timer value if it becomes negative', () => {
        const roomId = 'test-room';
        const decrement = 100;

        service.timers.set(roomId, 50);
        service.removeToTimer(roomId, decrement);

        expect(service.timers.get(roomId)).toEqual(0);
        expect(classicModeGateway.emitTimeToRoom).toHaveBeenCalledTimes(1);
        expect(classicModeGateway.emitTimeToRoom).toHaveBeenCalledWith(roomId, 0);
    });

    it('deleteTimerData should clear the timer interval and delete the timer data', () => {
        const roomId = 'test-room';
        const intervalId = setInterval(() => {}, 1000);

        service.intervals.set(roomId, intervalId);
        service.timers.set(roomId, 60);

        service.deleteTimerData(roomId);

        expect(service.intervals.has(roomId)).toBe(false);
        expect(service.timers.has(roomId)).toBe(false);
    });

    it('resetTimer should set the timer to 0 and delete the timer data', () => {
        const roomId = 'test-room';
        const initialTime = 60;

        service.timers.set(roomId, initialTime);
        service.intervals.set(
            roomId,
            setInterval(() => {}, 1000),
        );

        service.resetTimer(roomId);
        expect(service.intervals.has(roomId)).toBe(false);
    });

    it('isInitializedTimer should return true if the timer data is initialized', () => {
        const roomId = 'test-room';

        service.timers.set(roomId, 60);

        expect(service.isInitializedTimer(roomId)).toBe(true);
    });

    it('isInitializedTimer should return false if the timer data is not initialized', () => {
        const roomId = 'test-room';
        expect(service.isInitializedTimer(roomId)).toBe(false);
    });
});
