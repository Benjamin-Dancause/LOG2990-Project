import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousNextButtonComponent } from './previous-next-button.component';

describe('PreviousNextButtonComponent', () => {
    let component: PreviousNextButtonComponent;
    let fixture: ComponentFixture<PreviousNextButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PreviousNextButtonComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(PreviousNextButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit an event when onBack is called', () => {
        spyOn(component.back, 'emit');
        component.onBack();
        expect(component.back.emit).toHaveBeenCalled();
    });

    it('should emit an event when onNext is called', () => {
        spyOn(component.next, 'emit');
        component.onNext();
        expect(component.next.emit).toHaveBeenCalled();
    });
});
