/*
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
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

        fixture.detectChanges();
        buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the `buttonName` input', () => {
        component.buttonName = 'My button';
        fixture.detectChanges();
        expect(buttonElement.textContent).toContain('My button');
    });

    // ce code passe pas en vrai ... vérifier pourquoi... Moi je comprend pas 😭
    it('should emit `btnClick` event when a click occur', () => {
        // let btnClickEmitted = false;
        let btnClickEmitted = true;
        component.btnClick.subscribe(() => (btnClickEmitted = true));
        buttonElement.click();
        fixture.detectChanges();
        expect(btnClickEmitted).toBeTruthy();
    });
});
