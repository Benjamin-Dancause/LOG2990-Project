import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CounterService } from '@app/services/counter/counter.service';
import { CounterComponent } from './counter.component';
import SpyObj = jasmine.SpyObj;

describe('CounterComponent', () => {
    let component: CounterComponent;
    let counterServiceSpy: SpyObj<CounterService>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockSessionStorage: any = {};
    let fixture: ComponentFixture<CounterComponent>;

    beforeEach(async () => {
        counterServiceSpy = jasmine.createSpyObj('CounterService', ['initializeCounter', 'resetCounter', 'unsubscribeFrom']);
        await TestBed.configureTestingModule({
            declarations: [CounterComponent],
            providers: [{ provide: CounterService, useValue: counterServiceSpy }],
        }).compileComponents();

        mockSessionStorage = {};

        spyOn(sessionStorage, 'getItem').and.callFake((key: string): string => {
            return mockSessionStorage[key] || null;
        });

        spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string): void => {
            mockSessionStorage[key] = value;
        });

        fixture = TestBed.createComponent(CounterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(counterServiceSpy.resetCounter).toHaveBeenCalled();
        expect(counterServiceSpy.initializeCounter).toHaveBeenCalled();
    });

    it('should call isPlayer1() and return true', () => {
        const gameMaster = 'master';
        const userName = 'master';
        sessionStorage.setItem('gameMaster', gameMaster);
        sessionStorage.setItem('userName', userName);
        const result = component.isPlayer1();
        expect(result).toBeTruthy();
    });

    it('should call isPlayer1() and return false', () => {
        const gameMaster = 'master';
        const userName = 'joiner';
        sessionStorage.setItem('gameMaster', gameMaster);
        sessionStorage.setItem('userName', userName);
        const result = component.isPlayer1();
        expect(result).toBeFalsy();
    });
});
