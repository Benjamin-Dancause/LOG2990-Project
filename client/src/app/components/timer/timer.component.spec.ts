import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TimerService } from '@app/services/timer.service';
import { of, Subscription } from 'rxjs';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;
    let timerService: TimerService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TimerComponent],
            imports: [HttpClientModule],
            providers: [TimerService],
        }).compileComponents();

        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
        timerService = TestBed.inject(TimerService);

        spyOn(timerService, 'resetTimer').and.returnValue(of());
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should reset the timer on destroy', () => {
        component.ngOnDestroy();
        expect(timerService.resetTimer).toHaveBeenCalled();
    });

    it('should pad a value correctly', () => {
        expect(component.pad(1)).toBe('01');
        expect(component.pad(11)).toBe('11');
    });
    it('should pad the value with 0 if it is less than 10', () => {
        const result = component.pad(1);
        expect(result).toEqual('01');
    });

    it('should not pad the value with 0 if it is greater than or equal to 10', () => {
        const result = component.pad(10);
        expect(result).toEqual('10');
    });

    it('should unsubscribe on ngOnDestroy', () => {
        spyOn(Subscription.prototype, 'unsubscribe');
        component.ngOnInit();
        component.ngOnDestroy();
        expect(Subscription.prototype.unsubscribe).toHaveBeenCalled();
    });
    it('should subscribe to the interval and call timerService.getTime', fakeAsync(() => {
        spyOn(timerService, 'getTime').and.returnValue(of(61));
        component.ngOnInit();
        tick(1000);
        expect(timerService.getTime).toHaveBeenCalled();
        expect(component.min).toEqual(1);
        expect(component.sec).toEqual(1);
        expect(component.minutes).toEqual('01');
        expect(component.seconds).toEqual('01');
    }));
});
