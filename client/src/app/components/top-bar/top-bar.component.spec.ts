import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopBarComponent } from './top-bar.component';
@Component({})
class MockTimerComponent {
    min = 0;
    sec = 0;
    minutes = '00';
    seconds = '00';
}
@Component({})
class MockCounterComponent {
    count: number;
    player1: boolean;
    @Input() playerSide: boolean;
}

fdescribe('TopBarComponent', () => {
    let component: TopBarComponent;
    let fixture: ComponentFixture<TopBarComponent>;
    let mockSessionStorage: any = {};

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopBarComponent, MockTimerComponent, MockCounterComponent],
            imports: [HttpClientTestingModule],
        }).compileComponents();

        spyOn(sessionStorage, 'getItem').and.callFake((key: string): string => {
            return mockSessionStorage[key] || null;
        });

        spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string): void => {
            mockSessionStorage[key] = value;
        });

        fixture = TestBed.createComponent(TopBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have userName', () => {
        const stubUserName = 'stubUserName';
        mockSessionStorage['userName'] = stubUserName;

        component.ngOnInit();
        expect(sessionStorage.getItem).toHaveBeenCalled();
        expect(component.userName).toEqual(stubUserName);
    });

    it('should be empty if no userName has been saved', () => {
        const stubUserName = null;
        mockSessionStorage['userName'] = stubUserName;

        component.ngOnInit();
        expect(sessionStorage.getItem).toHaveBeenCalled();
        expect(component.userName).toEqual('');
    });

    it('should set userName to empty string if storedUserName is undefined or null', () => {
        mockSessionStorage['userName'] = undefined;
        component.ngOnInit();
        expect(component.userName).toEqual('');
    });

    it('should set opponent to empty joiningPlayer if userName is same as gameMaster', () => {
        component.single = false;
        mockSessionStorage['userName'] = 'test1';
        mockSessionStorage['gameMaster'] = 'test1';
        mockSessionStorage['joiningPlayer'] = 'test2';
        component.ngOnInit();
        expect(component.opponent).toEqual('test2');
    });
});
