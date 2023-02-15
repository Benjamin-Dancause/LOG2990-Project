import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CounterService } from '@app/services/counter.service';
import { of } from 'rxjs';
import { CounterComponent } from './counter.component';
import SpyObj = jasmine.SpyObj;

describe('CounterComponent', () => {
    let component: CounterComponent;
    let counterServiceSpy: SpyObj<CounterService>;
    let fixture: ComponentFixture<CounterComponent>;

    beforeEach(() => {
        counterServiceSpy = jasmine.createSpyObj('CounterService', ['getCounter', 'resetCounter']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CounterComponent],
            providers: [{ provide: CounterService, useValue: counterServiceSpy }],
            imports: [HttpClientModule],
        }).compileComponents();

        fixture = TestBed.createComponent(CounterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    /*
    describe('ngOnInit', () => {
        it('should initialize subscription to counter', () => {});
    });
    */
    /*
    describe('ngOnInit', () => {
        it('should initialize subscription to counter', () => {
            component.ngOnInit();
            expect(counterServiceSpy.getCounter).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should reset counter when component is destroyed', () => {
            component.ngOnDestroy();
            expect(counterServiceSpy.resetCounter).toHaveBeenCalled();
        });
    });
    */
    describe('ngOnInit', () => {
        it('should initialize subscription to counter', () => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            counterServiceSpy.getCounter.and.returnValue(of(5));
            component.ngOnInit();
            expect(counterServiceSpy.getCounter).toHaveBeenCalled();
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect(component.counter).toBe(5);
        });
    });

    /*
    describe('ngOnDestroy', () => {
        it('should reset counter', () => {
            component.ngOnDestroy();
            expect(counterServiceSpy.resetCounter).toHaveBeenCalled();
        });
    });
    */
});
