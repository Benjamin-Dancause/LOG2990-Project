import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GiveUpButtonComponent } from './give-up-button.component';

describe('GiveUpButtonComponent', () => {
    let component: GiveUpButtonComponent;
    let fixture: ComponentFixture<GiveUpButtonComponent>;
    let dialog: MatDialog;
    let debugElement: DebugElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, MatDialogModule],
            declarations: [GiveUpButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GiveUpButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        debugElement = fixture.debugElement.query(By.css('.button'));
        dialog = TestBed.inject(MatDialog);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call giveUpConfirmPrompt method when button is clicked', () => {
        spyOn(component, 'giveUpConfirmPrompt');
        debugElement.triggerEventHandler('click', null);
        expect(component.giveUpConfirmPrompt).toHaveBeenCalled();
    });

    it('should open dialog when giveUpConfirmPrompt is called', () => {
        spyOn(dialog, 'open').and.callThrough();
        component.giveUpConfirmPrompt();
        expect(dialog.open).toHaveBeenCalledWith(component.giveUpPromptTemplate, { width: '500px', height: '250px' });
    });
});
