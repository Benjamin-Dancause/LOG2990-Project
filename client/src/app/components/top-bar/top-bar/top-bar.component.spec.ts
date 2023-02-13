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
        let stubUserName = 'stubUserName';
        spyOn(localStorage, 'setItem');

        localStorage.setItem('userName', stubUserName);
        component.ngOnInit();
        expect(localStorage.getItem).toHaveBeenCalled();
        expect(component.userName).toEqual(stubUserName);
    });

    it('should be empty if no userName has been saved', () => {
        let stubUserName = undefined;
        spyOn(localStorage, 'setItem');

        localStorage.storeItem('userName', stubUserName);
        component.ngOnInit();
        expect(localStorage.getItem).toHaveBeenCalled();
        expect(component.userName).toEqual('');
    });
    
});
