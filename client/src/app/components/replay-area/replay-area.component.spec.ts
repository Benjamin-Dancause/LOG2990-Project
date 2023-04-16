import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplayAreaComponent } from './replay-area.component';

describe('ReplayAreaComponent', () => {
    let component: ReplayAreaComponent;
    let fixture: ComponentFixture<ReplayAreaComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReplayAreaComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ReplayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
