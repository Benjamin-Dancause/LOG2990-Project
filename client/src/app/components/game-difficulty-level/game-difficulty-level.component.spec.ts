import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameDifficultyLevelComponent } from './game-difficulty-level.component';

describe('GameDifficultyLevelComponent', () => {
    let component: GameDifficultyLevelComponent;
    let fixture: ComponentFixture<GameDifficultyLevelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameDifficultyLevelComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameDifficultyLevelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
