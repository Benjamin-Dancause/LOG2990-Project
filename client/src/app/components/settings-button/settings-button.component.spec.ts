import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { GameConfigService } from '@app/services/game-config/game-config.service';
import { of } from 'rxjs';
import { SettingsButtonComponent } from './settings-button.component';

fdescribe('SettingsButtonComponent', () => {
    let component: SettingsButtonComponent;
    let fixture: ComponentFixture<SettingsButtonComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let gameConfigServiceSpy: jasmine.SpyObj<GameConfigService>;

    beforeEach(() => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
        gameConfigServiceSpy = jasmine.createSpyObj('GameConfigService', [
            'getCountdownTime',
            'getPenaltyTime',
            'getTimeGained',
            'setCountdownTime',
            'setPenaltyTime',
            'setTimeGained',
        ]);

        TestBed.configureTestingModule({
            declarations: [SettingsButtonComponent],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: GameConfigService, useValue: gameConfigServiceSpy },
            ],
        });

        fixture = TestBed.createComponent(SettingsButtonComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('openSettings', () => {
        beforeEach(() => {
            gameConfigServiceSpy.getCountdownTime.and.returnValue(of(30));
            gameConfigServiceSpy.getPenaltyTime.and.returnValue(of(5));
            gameConfigServiceSpy.getTimeGained.and.returnValue(of(5));
            component.openSettings();
        });

        it('should set the countdownTime', () => {
            expect(component.countdownTime).toBe(30);
        });

        it('should set the penaltyTime', () => {
            expect(component.penaltyTime).toBe(5);
        });

        it('should set the timeGained', () => {
            expect(component.timeGained).toBe(5);
        });

        it('should open the dialog', () => {
            expect(dialogSpy.open).toHaveBeenCalledWith(component.settingsPopupTemplate, {
                width: '500px',
            });
        });
    });

    describe('close', () => {
        it('should close the dialog', () => {
            component.close();
            expect(dialogSpy.closeAll).toHaveBeenCalled();
        });
    });

    describe('save', () => {
        beforeEach(() => {
            gameConfigServiceSpy.setCountdownTime.and.returnValue(of(null));
            gameConfigServiceSpy.setPenaltyTime.and.returnValue(of(null));
            gameConfigServiceSpy.setTimeGained.and.returnValue(of(null));
            component.countdownTime = 10;
            component.penaltyTime = 3;
            component.timeGained = 7;
            component.save();
        });

        it('should set the countdownTime', () => {
            expect(gameConfigServiceSpy.setCountdownTime).toHaveBeenCalledWith(10);
        });

        it('should set the penaltyTime', () => {
            expect(gameConfigServiceSpy.setPenaltyTime).toHaveBeenCalledWith(3);
        });

        it('should set the timeGained', () => {
            expect(gameConfigServiceSpy.setTimeGained).toHaveBeenCalledWith(7);
        });

        it('should close the dialog', () => {
            expect(dialogSpy.closeAll).toHaveBeenCalled();
        });
    });

    describe('resetValues', () => {
        beforeEach(() => {
            component.countdownTime = 10;
            component.penaltyTime = 3;
            component.timeGained = 7;
            component.resetValues();
        });

        it('should reset countdownTime', () => {
            expect(component.countdownTime).toBe(30);
        });

        it('should reset penaltyTime', () => {
            expect(component.penaltyTime).toBe(5);
        });

        it('should reset timeGained', () => {
            expect(component.timeGained).toBe(5);
        });
    });
});
