/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerService } from '@app/services/timer.service';
import { of } from 'rxjs';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;
    let timerService: jasmine.SpyObj<TimerService>;

    beforeEach(async () => {
        timerService = jasmine.createSpyObj('TimerService', ['getTime', 'resetTimer']);
        await TestBed.configureTestingModule({
            declarations: [TimerComponent],
            providers: [{provide: TimerService, useValue: timerService}],
        }).compileComponents();

        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        timerService.getTime.and.returnValue(of(0));
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
    
    it('should reset the timer on destroy', () => {
        const roomId = 'test-room';
        spyOn(sessionStorage, 'getItem').and.returnValue(roomId);
        component.ngOnDestroy();
        expect(timerService.resetTimer).toHaveBeenCalledWith(roomId);
    });

    it('should pad a value correctly', () => {
        const time = 90;
        timerService.getTime.and.returnValue(of(time));
        component.ngOnInit();
        expect(component.minutes).toEqual('01');
        expect(component.seconds).toEqual('30');
    });

    it('should pad the value with 0 if it is less than 10', () => {
        const result = component.pad(1);
        expect(result).toEqual('01');
    });

    it('should not pad the value with 0 if it bigger or equal to 10', () => {
        const result = component.pad(10);
        expect(result).toEqual('10');
    });


});
