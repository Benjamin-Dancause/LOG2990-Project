import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopBarComponent } from './top-bar.component';

describe('TopBarComponent', () => {
    let component: TopBarComponent;
    let fixture: ComponentFixture<TopBarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopBarComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TopBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have userName', () => {
        const stubUserName = 'stubUserName';
        spyOn(localStorage, 'getItem').and.returnValue(stubUserName);
        spyOn(localStorage, 'setItem');

        localStorage.setItem('userName', stubUserName);
        component.ngOnInit();
        expect(localStorage.getItem).toHaveBeenCalled();
        expect(component.userName).toEqual(stubUserName);
    });

    it('should be empty if no userName has been saved', () => {
        const stubUserName = null;
        spyOn(localStorage, 'getItem').and.returnValue(stubUserName);
        spyOn(localStorage, 'setItem');

        component.ngOnInit();
        expect(localStorage.getItem).toHaveBeenCalled();
        expect(component.userName).toEqual('');
    });

    it('should set userName to empty string if storedUserName is undefined or null', () => {
        spyOn(localStorage, 'getItem').and.returnValue(null);
        component.ngOnInit();
        expect(component.userName).toEqual('');
    });
});
