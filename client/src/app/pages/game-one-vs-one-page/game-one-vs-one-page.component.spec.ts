import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { CounterComponent } from '@app/components/counter/counter.component';
import { GiveUpButtonComponent } from '@app/components/give-up-button/give-up-button.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { TopBarComponent } from '@app/components/top-bar/top-bar.component';
import { GameOneVsOnePageComponent } from './game-one-vs-one-page.component';

describe('GamePageComponent', () => {
    let component: GameOneVsOnePageComponent;
    let fixture: ComponentFixture<GameOneVsOnePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                GameOneVsOnePageComponent,
                SidebarComponent,
                PlayAreaComponent,
                GiveUpButtonComponent,
                TopBarComponent,
                TimerComponent,
                CounterComponent,
            ],
            imports: [HttpClientModule, MatDialogModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameOneVsOnePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should set showPopup to true when allDifferencesFound is true', () => {
    //     component.allDifferencesFound = true;
    //     component.ngOnInit();
    //     expect(component.showPopup).toBeTrue();
    // });

    it('should set showPopup to false when returnToMainMenu is called', () => {
        component.showPopup = true;
        component.returnToMainMenu();
        expect(component.showPopup).toBeFalse();
    });

    // it('should set allDifferencesFound to true and showPopup to true when findAllDifferences is called', () => {
    //     component.allDifferencesFound = false;
    //     component.showPopup = false;
    //     component.findAllDifferences();
    //     expect(component.allDifferencesFound).toBeTrue();
    //     expect(component.showPopup).toBeTrue();
    // });
});
