import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiveUpButtonComponent } from './give-up-button.component';

describe('GiveUpButtonComponent', () => {
    let component: GiveUpButtonComponent;
    let fixture: ComponentFixture<GiveUpButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GiveUpButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GiveUpButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
