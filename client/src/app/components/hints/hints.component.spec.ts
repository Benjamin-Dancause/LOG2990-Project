import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HintsComponent } from './hints.component';

describe('HintsComponent', () => {
    let component: HintsComponent;
    let fixture: ComponentFixture<HintsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HintsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(HintsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should decrement nbrIndices when the "i" key is pressed', () => {
        component.nbrIndices = 2;

        spyOn(component, 'decrementCounter');
        const event = new KeyboardEvent('keyup', { key: 'i' });
        window.dispatchEvent(event);

        expect(component.decrementCounter).toHaveBeenCalled();
        expect(component.nbrIndices).toEqual(2);
    });

    it('should decrement nbrIndices when decrementCounter is called and nbrIndices is greater than 0', () => {
        component.nbrIndices = 2;
        component.decrementCounter();

        expect(component.nbrIndices).toEqual(1);
    });

    it('should not decrement nbrIndices when decrementCounter is called and nbrIndices is already 0', () => {
        component.nbrIndices = 0;
        component.decrementCounter();

        expect(component.nbrIndices).toEqual(0);
    });

    it('should trigger "keydown" event with key "i" when onIndexClick is called', () => {
        spyOn(document, 'dispatchEvent');
        component.onIndexClick();

        expect(document.dispatchEvent).toHaveBeenCalledOnceWith(new KeyboardEvent('keydown', { key: 'i' }));
    });
});
