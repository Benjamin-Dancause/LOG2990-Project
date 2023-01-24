import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSelectionPageComponentComponent } from './game-selection-page-component.component';

describe('GameSelectionPageComponentComponent', () => {
    let component: GameSelectionPageComponentComponent;
    let fixture: ComponentFixture<GameSelectionPageComponentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameSelectionPageComponentComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameSelectionPageComponentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
