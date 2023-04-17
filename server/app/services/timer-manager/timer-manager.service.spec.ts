import { ClassicModeGateway } from '@app/gateways/timer/classic-mode.gateway';
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
});
