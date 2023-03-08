import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingToolsComponent } from './drawing-tools.component';

describe('DrawingToolsComponent', () => {
  let component: DrawingToolsComponent;
  let fixture: ComponentFixture<DrawingToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrawingToolsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawingToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
