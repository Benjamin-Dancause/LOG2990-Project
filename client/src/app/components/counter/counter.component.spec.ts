import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CounterService } from '@app/services/counter.service';
import { CounterComponent } from './counter.component';
import SpyObj = jasmine.SpyObj;

describe('CounterComponent', () => {
    let component: CounterComponent;
    let counterServiceSpy: SpyObj<CounterService>;
    let fixture: ComponentFixture<CounterComponent>;

    beforeEach(() => {
        counterServiceSpy = jasmine.createSpyObj('CounterService', ['getCounter', 'incrementCounter', 'resetCounter']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CounterComponent],
            providers: [{ provide: CounterService, useValue: counterServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(CounterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('ngOnInit', () => {
        it('should initialize subscription to counter', () => {});
    });
});
