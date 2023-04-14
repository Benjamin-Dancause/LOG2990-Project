import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingRoomLimitedPageComponent } from './waiting-room-limited-page.component';

describe('WaitingRoomLimitedPageComponent', () => {
  let component: WaitingRoomLimitedPageComponent;
  let fixture: ComponentFixture<WaitingRoomLimitedPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaitingRoomLimitedPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaitingRoomLimitedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
