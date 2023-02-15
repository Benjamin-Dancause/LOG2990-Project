import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SidebarComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set difficulty based on localStorage', () => {
        const storageKey = 'difficulty';
        const storageValue = 'facile';
        spyOn(localStorage, 'getItem').and.returnValue(storageValue);

        component.ngOnInit();

        expect(localStorage.getItem).toHaveBeenCalledWith(storageKey);
        expect(component.difficulty).toEqual(storageValue);
    });
});
