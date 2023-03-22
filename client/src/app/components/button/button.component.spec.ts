import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
    let component: ButtonComponent;
    let fixture: ComponentFixture<ButtonComponent>;
    let buttonElement: HTMLButtonElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonComponent);
        component = fixture.componentInstance;
        buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the `buttonName` input', () => {
        component.buttonName = 'My button';
        fixture.detectChanges();
        expect(buttonElement.textContent).toContain('My button');
    });

    it('should emit `btnClick` event when a click occur', fakeAsync(() => {
        let btnClickEmitted = false;
        component.btnClick.subscribe(() => (btnClickEmitted = true));
        buttonElement.click();
        tick();
        expect(btnClickEmitted).toBeTruthy();
    }));
});
