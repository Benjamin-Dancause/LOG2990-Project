import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SettingsButtonComponent } from './settings-button.component';

describe('SettingsButtonComponent', () => {
    let component: SettingsButtonComponent;
    let fixture: ComponentFixture<SettingsButtonComponent>;
    let debugElement: DebugElement;
    let dialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, MatDialogModule],
            declarations: [SettingsButtonComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SettingsButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        debugElement = fixture.debugElement.query(By.css('#settings'));
        dialog = TestBed.inject(MatDialog);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call openSettings method when button is clicked', () => {
        spyOn(component, 'openSettings');
        debugElement.triggerEventHandler('click', null);
        expect(component.openSettings).toHaveBeenCalled();
    });

    it('should open dialog when openSettings is called', () => {
        spyOn(dialog, 'open').and.callThrough();
        component.openSettings();
        expect(dialog.open).toHaveBeenCalledWith(component.settingsPopupTemplate, { width: '500px' });
    });
});
