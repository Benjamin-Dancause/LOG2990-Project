/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { ClassicModeGateway } from '@app/gateways/classic-mode/classic-mode.gateway';
import { GameConfigService } from '@app/services/game-config/game-config.service';
import { GameConstants } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { TimerManagerService } from './timer-manager.service';

describe('TimerManagerService', () => {
    let timerManagerService: TimerManagerService;
    let classicModeGateway: ClassicModeGateway;
    let gameConfigService: GameConfigService;

    beforeEach(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            providers: [
                TimerManagerService,
                {
                    provide: ClassicModeGateway,
                    useValue: {
                        emitTimeToRoom: jest.fn(),
                    },
                },
                {
                    provide: GameConfigService,
                    useValue: {
                        getCountdownTime: jest.fn().mockReturnValue(30),
                        getTimeGained: jest.fn().mockReturnValue(5),
                        getPenaltyTime: jest.fn().mockReturnValue(5),
                    },
                },
            ],
        }).compile();

        timerManagerService = moduleRef.get<TimerManagerService>(TimerManagerService);
        classicModeGateway = moduleRef.get<ClassicModeGateway>(ClassicModeGateway);
        gameConfigService = moduleRef.get<GameConfigService>(GameConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('startTimer', () => {
        it('should start the timer for the given room', () => {
            const roomId = '123';
            const gameMode = 'tl';
            const penaltyTime = -gameConfigService.getPenaltyTime();
            const constants: GameConstants = {
                startTime: gameConfigService.getCountdownTime(),
                increment: gameConfigService.getTimeGained(),
                penalty: penaltyTime,
            };

            timerManagerService.startTimer(roomId, gameMode);

            expect(timerManagerService.timers.has(roomId)).toBeTruthy();
            expect(timerManagerService.intervals.has(roomId)).toBeTruthy();
            expect(timerManagerService.constants.has(roomId)).toBeTruthy();
            expect(timerManagerService.constants.get(roomId)).toEqual(constants);
        });

        it('should not start the timer if it has already been started for the given room', () => {
            const roomId = '123';
            const gameMode = 'tl';

            timerManagerService.startTimer(roomId, gameMode);
            const previousTimer = timerManagerService.timers.get(roomId);
            const previousInterval = timerManagerService.intervals.get(roomId);
            const previousConstants = timerManagerService.constants.get(roomId);

            timerManagerService.startTimer(roomId, gameMode);

            expect(timerManagerService.timers.get(roomId)).toEqual(previousTimer);
            expect(timerManagerService.intervals.get(roomId)).toEqual(previousInterval);
            expect(timerManagerService.constants.get(roomId)).toEqual(previousConstants);
        });
    });

    describe('updateTimer', () => {
        it('should decrement the timer if gameMode is tl', () => {
            const roomId = '123';
            const gameMode = 'tl';
            timerManagerService.timers.set(roomId, 30);

            timerManagerService.updateTimer(roomId, gameMode);

            expect(timerManagerService.timers.get(roomId)).toEqual(29);
            expect(classicModeGateway.emitTimeToRoom).toHaveBeenCalledWith(roomId, 29);
        });

        it('should increment the timer if gameMode is not tl', () => {
            const roomId = '123';
            const gameMode = 'gm';
            timerManagerService.timers.set(roomId, 30);

            timerManagerService.updateTimer(roomId, gameMode);

            expect(timerManagerService.timers.get(roomId)).toEqual(31);
            expect(classicModeGateway.emitTimeToRoom).toHaveBeenCalledWith(roomId, 31);
        });
    });

    describe('addToTimer', () => {
        it('should add the time increment to the timer', () => {
            const roomId = 'room1';
            const startTime = 60;
            const increment = 10;
            const penalty = 5;
            const constants = { startTime, increment, penalty };
            timerManagerService.constants.set(roomId, constants);
            timerManagerService.timers.set(roomId, startTime);

            timerManagerService.addToTimer(roomId);

            expect(timerManagerService.timers.get(roomId)).toEqual(startTime + increment);
        });

        it('should cap the timer at 120 seconds', () => {
            const roomId = 'room1';
            const startTime = 110;
            const increment = 15;
            const penalty = 5;
            const constants = { startTime, increment, penalty };
            timerManagerService.constants.set(roomId, constants);
            timerManagerService.timers.set(roomId, startTime);

            timerManagerService.addToTimer(roomId);

            expect(timerManagerService.timers.get(roomId)).toEqual(120);
        });

        it('should emit the updated timer value to the room', () => {
            const roomId = 'room1';
            const startTime = 60;
            const increment = 10;
            const penalty = 5;
            const constants = { startTime, increment, penalty };
            timerManagerService.constants.set(roomId, constants);
            timerManagerService.timers.set(roomId, startTime);

            timerManagerService.addToTimer(roomId);

            expect(timerManagerService.classicModeGateway.emitTimeToRoom).toHaveBeenCalledWith(roomId, startTime + increment);
        });
    });

    describe('removeToTimer', () => {
        it('should remove the penalty time from the timer', () => {
            const roomId = 'room1';
            const startTime = 60;
            const increment = 10;
            const penalty = -5;
            const constants = { startTime, increment, penalty };
            timerManagerService.constants.set(roomId, constants);
            timerManagerService.timers.set(roomId, startTime);

            timerManagerService.removeToTimer(roomId);

            expect(timerManagerService.timers.get(roomId)).toEqual(startTime + penalty);
        });

        it('should set the timer to 0 if the penalty time would make it negative', () => {
            const roomId = 'room1';
            const startTime = 2;
            const increment = 10;
            const penalty = -15;
            const constants = { startTime, increment, penalty };
            timerManagerService.constants.set(roomId, constants);
            timerManagerService.timers.set(roomId, startTime);

            timerManagerService.removeToTimer(roomId);

            expect(timerManagerService.timers.get(roomId)).toEqual(0);
        });
    });

    describe('getTimeFromRoom', () => {
        it('should return the time for classic mode', () => {
            timerManagerService.timers.set('room1', 30);
            const time = timerManagerService.getTimeFromRoom('room1', 'cl');
            expect(time).toEqual(30);
        });

        it('should return the default time for classic mode if no time is set', () => {
            const time = timerManagerService.getTimeFromRoom('room1', 'cl');
            expect(time).toEqual(0);
        });

        it('should return the time for time-limited mode', () => {
            timerManagerService.timers.set('room1', 30);
            const time = timerManagerService.getTimeFromRoom('room1', 'tl');
            expect(time).toEqual(30);
        });
    });

    describe('deleteTimerData', () => {
        it('should delete timer data for the given room', () => {
            timerManagerService.timers.set('room1', 30);
            timerManagerService.intervals.set(
                'room1',
                setInterval(() => {}, 1000),
            );
            timerManagerService.constants.set('room1', {
                startTime: 60,
                increment: 10,
                penalty: -5,
            });
            timerManagerService.deleteTimerData('room1');
            expect(timerManagerService.timers.has('room1')).toBeFalsy();
            expect(timerManagerService.intervals.has('room1')).toBeFalsy();
            expect(timerManagerService.constants.has('room1')).toBeFalsy();
        });
    });

    describe('resetTimer', () => {
        it('should set the timer for a given room to undefined and delete the associated data', () => {
            const roomId = 'room1';

            timerManagerService.timers.set(roomId, 100);
            timerManagerService.constants.set(roomId, { startTime: 30, increment: 5, penalty: -10 });
            jest.spyOn(timerManagerService, 'deleteTimerData');

            timerManagerService.resetTimer(roomId);

            expect(timerManagerService.timers.get(roomId)).toEqual(undefined);
            expect(timerManagerService.deleteTimerData).toHaveBeenCalledWith(roomId);
        });
    });

    describe('isInitializedTimer', () => {
        it('should return true if a timer exists for a given room', () => {
            const roomId = 'room1';

            timerManagerService.timers.set(roomId, 100);

            const result = timerManagerService.isInitializedTimer(roomId);

            expect(result).toBe(true);
        });

        it('should return false if no timer exists for a given room', () => {
            const roomId = 'room1';

            const result = timerManagerService.isInitializedTimer(roomId);

            expect(result).toBe(false);
        });
    });
});
