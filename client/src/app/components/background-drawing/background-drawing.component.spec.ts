import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundDrawingComponent } from './background-drawing.component';

describe('BackgroundDrawingComponent', () => {
  let component: BackgroundDrawingComponent;
  let fixture: ComponentFixture<BackgroundDrawingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BackgroundDrawingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackgroundDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
