import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HintButtonComponent } from './hint-button.component';

describe('HintButtonComponent', () => {
  let component: HintButtonComponent;
  let fixture: ComponentFixture<HintButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HintButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HintButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
