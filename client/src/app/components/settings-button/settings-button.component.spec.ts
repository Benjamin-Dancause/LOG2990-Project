import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SettingsButtonComponent } from './settings-button.component';

describe('SettingsButtonComponent', () => {
    let component: SettingsButtonComponent;
    let fixture: ComponentFixture<SettingsButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [SettingsButtonComponent],
            providers: [{ provide: MatDialog, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SettingsButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
